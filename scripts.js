const electron = require('electron');
const fs = require('fs');
const { webContents } = electron;
const { ipcRenderer } = electron;

var myTextArea = document.querySelector('#working-note');
var editor = CodeMirror.fromTextArea(myTextArea, {
    lineNumbers: true,
    mode: "htmlmixed",
    theme: "elegant",
    autoCloseTags: true,
    autoCloseBrackets: true,
    lineWrapping: true
});

var appExit = function() {
    const result = ipcRenderer.send('app:exit');
}

var appMinimize = function() {
    const result = ipcRenderer.send('app:minimize');
}

var appMaximize = function() {
    const result = ipcRenderer.send('app:maximize');
}

var appUnmaximize = function() {
    const result = ipcRenderer.send('app:unmaximize');
}

var appMaxToggle = function() {
    if (window.innerWidth == 985 || window.innerHeight == 655) {
        appMaximize();
    } else {
        appUnmaximize();
    }
}

var saveNote = function() {
    let note = {
        title: document.querySelector('#working-title').value,
        value: editor.getValue()
    };
    fs.writeFile(`${__dirname}/notes/` + note.title + '.txt', note.value, function (err) {
        if (err) throw err;
    });
    fetchNotes();
}

var notes = [];

var loadSavedNotes = function() {
    let saveNoteCont = document.querySelector('#saved-notes');
    saveNoteCont.innerHTML = '';
    notes.forEach((note, index) => {
        let tempEl = document.createElement('div');
        tempEl.classList.add('note-card');
        tempEl.tabIndex = index + 2;
        tempEl.dataset.index = index;
        let tempElTitle = document.createElement('h3');
        tempElTitle.innerHTML = note.title;
        let tempElContent = document.createElement('p');
        tempElContent.innerText = note.content;
        let trashButton = document.createElement('span');
        trashButton.classList.add('delete-note');
        trashButton.innerHTML = '<i class="fi-rr-trash"></i>';
        tempEl.appendChild(tempElTitle);
        tempEl.appendChild(tempElContent);
        tempEl.appendChild(trashButton);
        tempEl.addEventListener('click', (event) => {
            if (!event.target.parentElement.classList.contains('delete-note')) {
                var noteCard = event.target;
                if (!noteCard.classList.contains('note-card')) {
                    noteCard = noteCard.parentElement;
                }
                loadNote(noteCard);
            } else {
                deleteNote(event.target);
            }
        });
        saveNoteCont.appendChild(tempEl);
    });
}

var loadNote = function(t) {
    var workingTitle = document.querySelector('#working-title');
    var workingNote = editor;
    workingTitle.value = t.querySelector('h3').innerText.replace('.txt', '');
    console.log(t);
    workingNote.setValue(notes[t.dataset.index].content);
};

var fetchNotes = function() {
    notes = [];
    fs.readdir(`${__dirname}/notes/`, (err, files) => {
        files.forEach((title, index) => {
            notes.push({title: title});
            fs.readFile(`${__dirname}/notes/` + notes[index].title, 'utf8', (err, data) => {
                if (data == undefined) {
                    console.log(err);
                }
                notes[index].content = data;
                if (index == files.length - 1) {
                    // loadSavedNotes();
                    setTimeout(loadSavedNotes, 150);
                }
            });
        });
    });
    if (notes.length == 0) {
        document.querySelector('#saved-notes').innerHTML = '';
    }
};

fetchNotes();
// setTimeout(loadSavedNotes, 500);

function newFile() {
    document.querySelector('#working-title').value = '';
    editor.setValue('');
}

function deleteNote(t) {
    let index = t.parentElement.parentElement.dataset.index;
    let path = notes[index].title;
    ipcRenderer.send('note:delete', path);
}

ipcRenderer.on('note:deleted', () => {
    console.log('deleted note!');
    fetchNotes();
});

// keyboard listeners
window.addEventListener('keyup', (event) => {
    if (event.key == "s" && event.ctrlKey === true) {
        saveNote();
    }
    if (event.key == "q" && event.ctrlKey === true) {
        appExit();
    }
    if (event.key == "n" && event.ctrlKey === true) {
        newFile();
    }
});