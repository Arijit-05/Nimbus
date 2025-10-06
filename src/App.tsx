import "./App.css"
import Header from './components/Header'
import React, { useEffect, useState } from "react"

type Note = {
  id: number,
  title: string,
  content: string
}

const App = () => {

  const [notes, setNotes] = useState<Note[]>([])
  const [noteColors, setNoteColors] = useState<Record<number, string>>({})
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)
  const [editOpen, setEditOpen] = useState(false)
  const [modalTitle, setModalTitle] = useState("")
  const [modalContent, setModalContent] = useState("")

  const colorPalette = [
    '#ffd35b', // yellow
    '#ffb3b3', // light red
    '#cfe8ff', // light blue
    '#d5ffd6', // light green
    '#ffe6cc', // light orange
    '#f0d6ff', // light purple
    '#fff3b0', // pale yellow
    '#e6f7ff', // pale cyan
  ]

  const getRandomColor = () => colorPalette[Math.floor(Math.random() * colorPalette.length)]

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const response = await fetch("https://nimbus-backend-two.vercel.app/api/notes")
        const notes: Note[] = await response.json()
        setNotes(notes)
        // assign colors for each note id (preserve existing when possible)
        setNoteColors((prev) => {
          const next: Record<number, string> = { ...prev }
          notes.forEach((n) => {
            if (!next[n.id]) next[n.id] = getRandomColor()
          })
          return next
        })
      } catch (err) {
        console.log(err)
      }
    }

    fetchNotes()
  }, [])
  
  const handleNoteClick = (note: Note) => {
    // open editor modal instead of populating main form
    setSelectedNote(note)
    setModalTitle(note.title)
    setModalContent(note.content)
    setEditOpen(true)
  }

  const handleAddNote = async (event: React.FormEvent) => {
    event.preventDefault()

    try {
      const response = await fetch("https://nimbus-backend-two.vercel.app/api/notes", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({title, content})
      })

      if (!response.ok) {
        const text = await response.text()
        throw new Error(`Add note failed: ${response.status} ${text}`)
      }

      const newNote = await response.json()

  // add color for the new note
  setNoteColors((prev) => ({ ...prev, [newNote.id]: getRandomColor() }))
  setNotes([newNote, ...notes])
      setTitle("")
      setContent("")
    } catch (err) {
      console.error(err)
      alert('Could not add note: ' + (err instanceof Error ? err.message : String(err)))
    }
  }

  // Updates are handled in the editor modal now
  const saveEditedNote = async () => {
    if (!selectedNote) return
    try {
      const response = await fetch(`https://nimbus-backend-two.vercel.app/api/notes/${selectedNote.id}`, {
        method: 'PUT',
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ title: modalTitle, content: modalContent })
      })

      if (!response.ok) {
        const txt = await response.text()
        throw new Error(`Update failed: ${response.status} ${txt}`)
      }

      const updatedNote = await response.json()
      setNotes((prev) => prev.map((n) => n.id === updatedNote.id ? updatedNote : n))
    } catch (err) {
      console.error(err)
      alert('Could not update note: ' + (err instanceof Error ? err.message : String(err)))
    } finally {
      setEditOpen(false)
      setSelectedNote(null)
      setModalTitle("")
      setModalContent("")
    }
  }

  const handleCancel = () => {
    setTitle("")
    setContent("")
    setSelectedNote(null)
  }

  const deleteNote = async (event: React.MouseEvent, noteId: number) => {
    event.stopPropagation()

    try {
      await fetch(`https://nimbus-backend-two.vercel.app/api/notes/${noteId}`, { 
        method: "DELETE"
      })
      const updatedNotes = notes.filter((note) => note.id !== noteId)
      setNotes(updatedNotes)
      setNoteColors((prev) => {
        const copy = { ...prev }
        delete copy[noteId]
        return copy
      })
    } catch (error) {
      console.log(error)
    }
  }

  // Confirmation modal state
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [noteToDelete, setNoteToDelete] = useState<number | null>(null)

  const openConfirm = (event: React.MouseEvent, noteId: number) => {
    event.stopPropagation()
    setNoteToDelete(noteId)
    setConfirmOpen(true)
  }

  const confirmDelete = async () => {
    if (noteToDelete == null) return
    try {
      await fetch(`https://nimbus-backend-two.vercel.app/api/notes/${noteToDelete}`, { method: "DELETE" })
      setNotes((prev) => prev.filter((n) => n.id !== noteToDelete))
      setNoteColors((prev) => {
        const copy = { ...prev }
        if (noteToDelete != null) delete copy[noteToDelete]
        return copy
      })
    } catch (err) {
      console.error(err)
    } finally {
      setConfirmOpen(false)
      setNoteToDelete(null)
    }
  }

  const cancelDelete = () => {
    setConfirmOpen(false)
    setNoteToDelete(null)
  }

  return (
    <>
    
    <Header /> 

    <div className="app-container">

      <form className="note-form" onSubmit={(event) => 
        handleAddNote(event)}>

        <input 
          value={title} 
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Title" 
          required >
        </input>

        <textarea 
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder="Content" 
          rows={10} 
          required >
        </textarea>

        <button type="submit">Add note</button>

      </form>

      <div className="notes-grid">

        {notes.map((note) => (
          <div key={note.id} className="note-item" onClick={() => handleNoteClick(note)} style={{ backgroundColor: noteColors[note.id] ?? '#ffd35b' }}>
            <div className="notes-header">
              <button onClick={(event) => openConfirm(event, note.id)}>x</button>
            </div>
            <h2>{note.title}</h2>
            <p>{note.content}</p>
          </div>
        ))}

        {confirmOpen && (
          <div className="modal-overlay" onClick={cancelDelete}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <p>Do you want to delete this note?</p>
              <div className="modal-buttons">
                <button className="delete-yes" onClick={confirmDelete}>Yes</button>
                <button className="delete-no" onClick={cancelDelete}>No</button>
              </div>
            </div>
          </div>
        )}

        {editOpen && selectedNote && (
          <div className="modal-overlay" onClick={() => setEditOpen(false)}>
            <div className="editor-modal" onClick={(e) => e.stopPropagation()}>
              <input value={modalTitle} onChange={(e) => setModalTitle(e.target.value)} placeholder="Title" />
              <textarea value={modalContent} onChange={(e) => setModalContent(e.target.value)} rows={8} />
              <div className="modal-buttons">
                <button className="delete-yes" onClick={saveEditedNote}>Save</button>
                <button className="delete-no" onClick={() => setEditOpen(false)}>Cancel</button>
              </div>
            </div>
          </div>
        )}

      </div>

    </div>

    </>
  )
}

export default App