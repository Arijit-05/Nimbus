import "./App.css"
import React, { useEffect, useState } from "react"

type Note = {
  id: number,
  title: string,
  content: string
}

const App = () => {

  const [notes, setNotes] = useState<Note[]>([])

  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/notes")
        const notes: Note[] = await response.json()
        setNotes(notes)
      } catch (err) {
        console.log(err)
      }
    }

    fetchNotes()
  }, [])
  
  const handleNoteClick = (note: Note) => {
    setSelectedNote(note)
    setTitle(note.title)
    setContent(note.content)
  }

  const handleAddNote = async (event: React.FormEvent) => {
    event.preventDefault()

    try {
      const response = await fetch("http://localhost:5000/api/notes", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({title, content})
      })

      if (!response.ok) {
        const text = await response.text()
        throw new Error(`Add note failed: ${response.status} ${text}`)
      }

      const newNote = await response.json()

      setNotes([newNote, ...notes])
      setTitle("")
      setContent("")
    } catch (err) {
      console.error(err)
      alert('Could not add note: ' + (err instanceof Error ? err.message : String(err)))
    }
  }

  const handleUpdateNote = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!selectedNote) {
      return
    }

    try {
      const response = await fetch(`http://localhost:5000/api/notes/${selectedNote.id}`, {
        method: 'PUT',
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          title, content
        })
      })

      const updatedNote = await response.json()

      const updatedNotesList = notes.map((note) =>
        note.id === selectedNote.id ? updatedNote : note
      )

      setNotes(updatedNotesList)
      setTitle("")
      setContent("")
      setSelectedNote(null)
    } catch (error) {
      console.log(error)
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
      await fetch(`http://localhost:5000/api/notes/${noteId}`, { 
        method: "DELETE"
      })
      const updatedNotes = notes.filter((note) => note.id !== noteId)
      setNotes(updatedNotes)
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
      await fetch(`http://localhost:5000/api/notes/${noteToDelete}`, { method: "DELETE" })
      setNotes((prev) => prev.filter((n) => n.id !== noteToDelete))
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
    <div className="app-container">

      <form className="note-form" onSubmit={(event) => 
        selectedNote ? handleUpdateNote(event) : handleAddNote(event)}>

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

        {selectedNote ? (
          <div className="edit-buttons">
            <button type="submit">Save</button>
            <button onClick={handleCancel}>Cancel</button>
          </div>
          ) : (
            <button type="submit">Add note</button>
          )
        }

      </form>

      <div className="notes-grid">

        {notes.map((note) => (
          <div key={note.id} className="note-item" onClick={() => handleNoteClick(note)}>
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

      </div>

    </div>
  )
}

export default App