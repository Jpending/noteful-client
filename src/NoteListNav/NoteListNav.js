import React from 'react'
import { NavLink, Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import CircleButton from '../CircleButton/CircleButton'
import ApiContext from '../ApiContext'
import { countNotesForFolder } from '../notes-helpers'
import './NoteListNav.css'
import config from '../config'

export default class NoteListNav extends React.Component {
  static contextType = ApiContext;
  constructor(props) {
    super(props);
    this.state = {
      foldertodelete: null
    }
  }
  handleMouseEnter = (id) => {
    this.setState({
      foldertodelete: id
    });
  }
  handleClickDelete = e => {
    e.preventDefault()
    const folderId = this.state.foldertodelete
    console.log(folderId);
    fetch(`${config.API_ENDPOINT}/folders/${folderId}`, {
      method: 'DELETE',
      headers: {
        'content-type': 'application/json'
      },
    })
      .then(res => {
        if (!res.ok)
          return res.json().then(e => Promise.reject(e))
        return res.json()
      })
      .then(() => {
        this.context.deleteFolder(folderId)
        this.props.onDeleteFolder(folderId)
      })
      .catch(error => {
        console.error({ error })
      })
  }

  static defaultProps = {
    onDeleteFolder: () => { },
  }
  static contextType = ApiContext;

  render() {
    const { folders = [], notes = [] } = this.context
    return (
      <div className='NoteListNav'>
        <ul className='NoteListNav__list'>
          {folders.map(folder =>
            <li key={folder.id}>
              <NavLink
                className='NoteListNav__folder-link'
                to={`/folder/${folder.id}`}
              >
                <span className='NoteListNav__num-notes'>
                  {countNotesForFolder(notes, folder.id)}
                </span>
                {folder.title}
              </NavLink>
              <button
                className='folder__delete'
                type='button' onMouseOver={() => { this.handleMouseEnter(folder.id) }}
                onClick={this.handleClickDelete}
              >
                <FontAwesomeIcon icon='trash-alt' />
                {' '}
          remove
        </button>
            </li>
          )}
        </ul>
        <div className='NoteListNav__button-wrapper'>
          <CircleButton
            tag={Link}
            to='/add-folder'
            type='button'
            className='NoteListNav__add-folder-button'
          >
            <FontAwesomeIcon icon='plus' />
            <br />
            Folder
          </CircleButton>
        </div>
      </div>
    )
  }
}
