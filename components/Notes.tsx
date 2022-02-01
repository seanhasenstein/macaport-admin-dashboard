import React from 'react';
import { UseMutationResult } from 'react-query';
import styled from 'styled-components';
import { format } from 'date-fns';
import { Note } from '../interfaces';
import { createId } from '../utils';
import NoteMenu from '../components/NoteMenu';
import LoadingSpinner from './LoadingSpinner';

type Props = {
  label: string;
  notes: Note[];
  addNote: UseMutationResult<
    any,
    unknown,
    Note,
    {
      previousNotes: Note[];
      newNote: Note;
    }
  >;
  updateNote: UseMutationResult<
    any,
    unknown,
    Note,
    {
      previousNotes: Note[] | undefined;
      updatedNote: Note;
    }
  >;
  deleteNote: UseMutationResult<
    any,
    unknown,
    string,
    {
      previousNotes: Note[] | undefined;
    }
  >;
};

export default function Notes({
  label,
  notes,
  addNote,
  updateNote,
  deleteNote,
}: Props) {
  const [showNoteTextArea, setShowNoteTextArea] = React.useState<
    string | undefined
  >(undefined);
  const [newNoteText, setNewNoteText] = React.useState('');
  const [updateNoteText, setUpdateNoteText] = React.useState('');

  const handleEditButtonClick = (note: Note) => {
    setShowNoteTextArea(note.id);
    setUpdateNoteText(note.text);
  };

  const handleAddNoteButtonClick = () => {
    const newNote = {
      id: createId('note'),
      text: newNoteText,
      createdAt: `${new Date()}`,
    };
    addNote.mutate(newNote);
    setNewNoteText('');
    setShowNoteTextArea(undefined);
  };

  const handleUpdateNoteButtonClick = (note: Note) => {
    updateNote.mutate({ ...note, text: updateNoteText });
    setUpdateNoteText('');
    setShowNoteTextArea(undefined);
  };

  const handleUpdateCancelButtonClick = () => {
    setShowNoteTextArea(undefined);
    setUpdateNoteText('');
  };

  return (
    <NotesStyles>
      <div className="notes-header">
        <h3>{label} notes</h3>
      </div>
      <div>
        {notes?.length > 0 ? (
          <div className="notes">
            {notes.map(n => (
              <div key={n.id} className="note">
                {showNoteTextArea === n.id ? (
                  <div className="edit-note">
                    <textarea
                      name={n.id}
                      id={n.id}
                      value={updateNoteText}
                      onChange={e => setUpdateNoteText(e.target.value)}
                    />
                    <div className="actions">
                      <button
                        type="button"
                        className="cancel-button"
                        onClick={handleUpdateCancelButtonClick}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        className="save-button"
                        onClick={() => handleUpdateNoteButtonClick(n)}
                      >
                        Save Changes
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div>
                      <div className="text">{n.text}</div>
                      <div className="date">
                        {format(new Date(n.createdAt), 'LLL dd, yyyy, h:mm a')}
                      </div>
                    </div>
                    <NoteMenu
                      note={n}
                      deleteNote={deleteNote.mutate}
                      handleEditButtonClick={handleEditButtonClick}
                    />
                  </>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-notes">
            This {label.toLowerCase()} has no notes.
          </div>
        )}
        <div className="new-add add-note-section">
          <textarea
            name="new-note"
            id="new-note"
            placeholder="Add a note..."
            value={newNoteText}
            onChange={e => setNewNoteText(e.target.value)}
          />
          <div className="actions">
            <LoadingSpinner isLoading={addNote.isLoading} />
            <button
              type="button"
              className="save-button"
              onClick={handleAddNoteButtonClick}
            >
              Add Note
            </button>
          </div>
        </div>
      </div>
    </NotesStyles>
  );
}

const NotesStyles = styled.div`
  margin: 4rem 0 0;

  .notes-header {
    margin: 0 0 2rem;
    padding: 0 0 1rem;
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    border-bottom: 1px solid #dcdfe4;

    h3 {
      margin: 0;
    }
  }

  .menu-button-container {
    margin-left: auto;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .note-menu-button {
    padding: 0;
    height: 1.5rem;
    width: 2rem;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: transparent;
    border: none;
    color: #6b7280;
    cursor: pointer;

    &:hover {
      color: #111827;
    }

    svg {
      height: 1rem;
      width: 1rem;
    }
  }

  .menu {
    padding: 0 1rem;
    position: absolute;
    right: 1rem;
    top: 2.75rem;
    display: none;
    flex-direction: column;
    align-items: flex-start;
    background-color: #fff;
    border-radius: 0.5rem;
    box-shadow: rgb(255, 255, 255) 0px 0px 0px 0px,
      rgba(17, 24, 39, 0.05) 0px 0px 0px 1px,
      rgba(0, 0, 0, 0.1) 0px 4px 6px -1px, rgba(0, 0, 0, 0.06) 0px 2px 4px -1px;

    &.show {
      display: flex;
      z-index: 100;
    }
  }

  .edit-link,
  .edit-button,
  .delete-button {
    padding: 0.75rem 2rem 0.75rem 0;
    width: 100%;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background-color: transparent;
    border: none;
    font-size: 0.875rem;
    font-weight: 400;
    color: #1f2937;
    text-align: left;
    cursor: pointer;

    &:hover {
      color: #111827;

      svg {
        color: #6b7280;
      }
    }

    svg {
      height: 1rem;
      width: 1rem;
      color: #9ca3af;
    }
  }

  .edit-button,
  .edit-link {
    border-bottom: 1px solid #e5e7eb;
  }

  .delete-button:hover {
    color: #991b1b;

    svg {
      color: #991b1b;
    }
  }

  .add-note-section {
    padding: 1rem 0;
    max-width: 36rem;
    width: 100%;

    &.new-add {
      margin: 1.5rem 0 0;
    }

    textarea {
      padding: 0.75rem 1.125rem;
      width: 100%;
      min-height: 7rem;
      border-radius: 0.375rem;
    }
  }

  .notes {
    margin: 1.5rem 0 0;
    max-width: 36rem;
    width: 100%;
  }

  .note {
    margin: 0 0 1.125rem;
    padding: 1rem 1.5rem;
    position: relative;
    display: flex;
    border: 1px solid #dcdfe4;
    border-radius: 0.375rem;
    box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);

    .text {
      margin: 0 0 0.1875rem;
      font-size: 0.9375rem;
      font-weight: 500;
      color: #1f2937;
    }

    .date {
      font-size: 0.8125rem;
      font-weight: 500;
      color: #9ca3af;
    }

    .edit-note {
      width: 100%;
    }

    textarea {
      width: 100%;
      resize: none;
    }
  }

  .actions {
    margin: 0.625rem 0 0;
    display: flex;
    justify-content: flex-end;
    gap: 0.875rem;
  }

  .cancel-button,
  .save-button {
    padding: 0.375rem 0.75rem;
    font-weight: 500;
    border-radius: 0.25rem;
    cursor: pointer;
  }

  .cancel-button {
    background-color: #fff;
    border: 1px solid #d1d5db;
    color: #374151;
    box-shadow: rgba(0, 0, 0, 0) 0px 0px 0px 0px,
      rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0.1) 0px 1px 2px 0px,
      rgba(0, 0, 0, 0.02) 0px 1px 1px 0px;

    &:hover {
      background-color: #f9fafb;
      color: #111827;
    }
  }

  .save-button {
    background-color: #1f2937;
    color: #fff;
    border: 1px solid transparent;

    &:hover {
      background-color: #263244;
    }

    &:focus {
      outline: 2px solid transparent;
      outline-offset: 2px;
    }

    &:focus-visible {
      box-shadow: rgb(255, 255, 255) 0px 0px 0px 2px, #1c5eb9 0px 0px 0px 4px,
        rgba(0, 0, 0, 0) 0px 0px 0px 0px;
    }
  }

  .empty-notes {
    font-size: 1rem;
    font-weight: 500;
    color: #6b7280;
  }
`;
