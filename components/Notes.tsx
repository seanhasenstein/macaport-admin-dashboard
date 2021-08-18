import React from 'react';
import styled from 'styled-components';
import { format } from 'date-fns';
import { Note } from '../interfaces';
import NoteMenu from '../components/NoteMenu';

type Props = {
  label: string;
  notes: Note[];
  addNote: (n: string) => void;
  updateNote: (n: Note) => void;
  deleteNote: (id: string) => void;
};

export default function Notes({
  label,
  notes,
  addNote,
  updateNote,
  deleteNote,
}: Props) {
  const [showMenu, setShowMenu] = React.useState<string | undefined>(undefined);
  const [showNoteTextArea, setShowNoteTextArea] = React.useState<
    string | undefined
  >(undefined);
  const [newNoteText, setNewNoteText] = React.useState('');
  const [updateNoteText, setUpdateNoteText] = React.useState('');

  const handleMenuButtonClick = (id: string) => {
    if (id === showMenu) {
      setShowMenu(undefined);
    } else {
      setShowMenu(id);
    }
  };

  const handleEditButtonClick = (note: Note) => {
    setShowMenu(undefined);
    setShowNoteTextArea(note.id);
    setUpdateNoteText(note.text);
  };

  const handleAddNoteButtonClick = () => {
    addNote(newNoteText);
    setNewNoteText('');
    setShowNoteTextArea(undefined);
  };

  const handleUpdateNoteButtonClick = (note: Note) => {
    updateNote({ ...note, text: updateNoteText });
    setUpdateNoteText('');
    setShowNoteTextArea(undefined);
  };

  const handleAddCancelButtonClick = () => {
    setShowNoteTextArea(undefined);
    setNewNoteText('');
  };

  const handleUpdateCancelButtonClick = () => {
    setShowNoteTextArea(undefined);
    setUpdateNoteText('');
  };

  return (
    <NotesStyles>
      <div className="row">
        <h4>{label} Notes</h4>
        <button
          type="button"
          className="add-note-button"
          onClick={() => setShowNoteTextArea('new')}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
              clipRule="evenodd"
            />
          </svg>
          Add a note
        </button>
      </div>
      <div>
        {showNoteTextArea === 'new' ? (
          <div className="add-note-section">
            <textarea
              name="new-note"
              id="new-note"
              placeholder="Add a note..."
              value={newNoteText}
              onChange={e => setNewNoteText(e.target.value)}
            />
            <div className="actions">
              <button
                type="button"
                className="cancel-button"
                onClick={handleAddCancelButtonClick}
              >
                Cancel
              </button>
              <button
                type="button"
                className="save-button"
                onClick={handleAddNoteButtonClick}
              >
                Add Note
              </button>
            </div>
          </div>
        ) : null}
        {notes?.length > 0 ? (
          <>
            {notes.map(n => (
              <div key={n.id} className="note">
                <div className="icon">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
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
                    <button
                      type="button"
                      className="menu-button"
                      onClick={() => handleMenuButtonClick(n.id)}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                      </svg>
                    </button>
                    <NoteMenu
                      note={n}
                      showMenu={showMenu}
                      setShowMenu={setShowMenu}
                      deleteNote={deleteNote}
                      handleEditButtonClick={handleEditButtonClick}
                    />
                  </>
                )}
              </div>
            ))}
          </>
        ) : (
          <div className="empty">This {label.toLowerCase()} has no notes.</div>
        )}
      </div>
    </NotesStyles>
  );
}

const NotesStyles = styled.div`
  padding: 4rem 0;
  border-top: 1px solid #e5e7eb;

  .add-note-button {
    padding: 0.625rem 1.25rem;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 0.9375rem;
    font-weight: 500;
    color: #374151;
    background-color: #fff;
    border: 1px solid #d1d5db;
    border-radius: 0.25rem;
    cursor: pointer;
    box-shadow: rgba(0, 0, 0, 0) 0px 0px 0px 0px,
      rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 1px 2px 0px;

    &:hover {
      background-color: #f9fafb;
    }

    svg {
      margin: 0 0.375rem 0 0;
      height: 1.125rem;
      width: 1.125rem;
      color: #9ca3af;
    }
  }

  .menu-button {
    margin-left: auto;
    padding: 0.125rem;
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
    padding: 0.125rem 0.5rem;
    position: absolute;
    right: 0;
    top: 3rem;
    display: none;
    flex-direction: column;
    align-items: flex-start;
    background-color: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 0.25rem;
    box-shadow: rgba(0, 0, 0, 0) 0px 0px 0px 0px,
      rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px,
      rgba(0, 0, 0, 0.02) 0px 4px 6px -2px;

    &.show {
      display: flex;
      z-index: 100;
    }
  }

  .edit-link,
  .edit-button,
  .delete-button {
    padding: 0.75rem 2rem 0.75rem 0.25rem;
    width: 100%;
    display: flex;
    align-items: center;
    gap: 0.375rem;
    background-color: transparent;
    border: none;
    font-size: 0.875rem;
    font-weight: 500;
    color: #6b7280;
    text-align: left;
    cursor: pointer;

    &:hover {
      color: #111827;

      svg {
        color: #9ca3af;
      }
    }

    svg {
      height: 0.9375rem;
      width: 0.9375rem;
      color: #d1d5db;
    }
  }

  .edit-button,
  .edit-link {
    border-bottom: 1px solid #e5e7eb;
  }

  .delete-button:hover {
    color: #b91c1c;

    svg {
      color: #e3bebe;
    }
  }

  .row {
    margin: 0 0 1.5rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .add-note-section {
    padding: 0 0 1rem;
    width: 100%;
    border-bottom: 1px solid #e5e7eb;

    textarea {
      width: 100%;
    }
  }

  .note {
    padding: 1rem 0;
    position: relative;
    display: flex;
    border-bottom: 1px solid #e5e7eb;

    &:last-of-type {
      border-bottom: none;
    }

    .text {
      margin: 0 0 0.25rem;
      font-size: 0.9375rem;
      font-weight: 500;
      color: #374151;
    }

    .date {
      font-size: 0.875rem;
      color: #89909d;
    }

    .icon {
      margin: 0 1.125rem 0 0;

      svg {
        height: 1.125rem;
        width: 1.125rem;
        color: #9ca3af;
      }
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
    margin: 0.375rem 0 0;
    display: flex;
    justify-content: flex-end;
    gap: 0.625rem;
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
    background-color: #4f46e5;
    color: #fff;
    border: 1px solid transparent;

    &:hover {
      background-color: #4338ca;
    }

    &:focus {
      outline: 2px solid transparent;
      outline-offset: 2px;
      box-shadow: rgb(255, 255, 255) 0px 0px 0px 2px,
        rgb(99, 102, 241) 0px 0px 0px 4px, rgba(0, 0, 0, 0) 0px 0px 0px 0px;
    }
  }

  .empty {
    margin: 1.5rem 0 0;
    font-size: 1rem;
    font-weight: 500;
    color: #89909d;
  }
`;
