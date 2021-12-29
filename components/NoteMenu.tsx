import React from 'react';
import { Note } from '../interfaces';
import useOutsideClick from '../hooks/useOutsideClick';
import useEscapeKeydownClose from '../hooks/useEscapeKeydownClose';

type Props = {
  note: Note;
  deleteNote: (id: string) => void;
  handleEditButtonClick: (n: Note) => void;
};

export default function NoteMenu({
  note,
  deleteNote,
  handleEditButtonClick,
}: Props) {
  const menuRef = React.useRef<HTMLDivElement>(null);
  const [showMenu, setShowMenu] = React.useState(false);
  useOutsideClick(showMenu, setShowMenu, menuRef);
  useEscapeKeydownClose(showMenu, setShowMenu);

  return (
    <>
      <button
        type="button"
        className="note-menu-button"
        onClick={() => setShowMenu(!showMenu)}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
        </svg>
      </button>
      <div ref={menuRef} className={`menu ${showMenu ? 'show' : ''}`}>
        <button
          type="button"
          className="edit-button"
          onClick={() => handleEditButtonClick(note)}
        >
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
              d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
            />
          </svg>
          Edit Note
        </button>
        <button
          type="button"
          className="delete-button"
          onClick={() => deleteNote(note.id)}
        >
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
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
          Delete Note
        </button>
      </div>
    </>
  );
}
