/* eslint-disable no-useless-escape */
import React, { Component } from 'react'
import NotefulForm from '../NotefulForm/NotefulForm'
import ApiContext from '../ApiContext'
import config from '../config'
import './AddNote.css'
import ValidationError from '../Validator'

export default class AddNote extends Component {
  constructor(props) {
    super(props);
    this.state = {
      title: "",
      content: "",
      folderId: null,
      titleValid: false,
      folderIdValid: false,
      formValid: /*{this.titleValid && this.folderIdValid ? true : }*/false,
      validationMessages: {
        title: '',
        content: '',
        folderId: 'Please pick a folder'
      }
    }
  }

  updateTitle(title) {
    this.setState({ title }, () => { this.validateTitle(title) });
  }

  updateContent(content) {
    this.setState({ content }, () => { this.validateContent(content) });
  }

  updateFolderId(folderId) {
    this.setState({ folderId }, () => { this.validateFolderId(folderId) });
  }

  validateContent(fieldValue) {
    const fieldErrors = { ...this.state.validationMessages };
    let hasError = false;

    fieldValue = fieldValue.trim();
    if (fieldValue.length === 0) {
      fieldErrors.content = 'Content is required';
      hasError = true;
    } if (!this.isValid(fieldValue)) {
      fieldErrors.content = 'Special Characters are not allowed.';
      hasError = true;
    } else {
      if (fieldValue.length < 3) {
        fieldErrors.content = 'Content must be at least 10 characters long';
        hasError = true;
      } else {
        fieldErrors.content = '';
        hasError = false;
      }
    }

    this.setState({
      validationMessages: fieldErrors,
      titleValid: !hasError
    }, this.formValid);

  }

  validateTitle(fieldValue) {
    const fieldErrors = { ...this.state.validationMessages };
    let hasError = false;

    fieldValue = fieldValue.trim();
    if (fieldValue.length === 0) {
      fieldErrors.title = 'title is required';
      hasError = true;
    } if (!this.isValid(fieldValue)) {
      fieldErrors.title = 'Special Characters are not allowed.';
      hasError = true;
    } else {
      if (fieldValue.length < 3) {
        fieldErrors.title = 'title must be at least 3 characters long';
        hasError = true;
      } else {
        fieldErrors.title = '';
        hasError = false;
      }
    }

    this.setState({
      validationMessages: fieldErrors,
      titleValid: !hasError
    }, this.formValid);

  }

  isValid = function (str) {
    return !/[~`#$%\^&*+=\-\[\]\\';/{}|\\":<>\?]/g.test(str);
  }

  validateFolderId(fieldValue) {
    const fieldErrors = { ...this.state.validationMessages };
    let hasError = false;

    fieldValue = fieldValue.trim();
    if (fieldValue === "..." || fieldValue === null) {
      fieldErrors.folderId = 'Folder choice is required';
      hasError = true;
    }
    else {
      fieldErrors.folderId = '';
      hasError = false;
    }

    this.setState({
      validationMessages: fieldErrors,
      folderIdValid: !hasError
    }, this.formValid);

  }


  formValid() {
    this.setState({
      formValid: this.state.titleValid && this.state.folderIdValid
    });
  }

  static defaultProps = {
    history: {
      push: () => { }
    },
  }
  static contextType = ApiContext;

  handleSubmit = e => {
    e.preventDefault()
    const newNote = {
      title: e.target['note-title'].value,
      content: e.target['note-content'].value,
      folder_id: e.target['note-folder-id'].value,
    }
    fetch(`${config.API_ENDPOINT}/notes`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify(newNote),
    })
      .then(res => {
        if (!res.ok)
          return res.json().then(e => Promise.reject(e))
        return res.json()
      })
      .then(note => {
        this.context.addNote(note)
        this.props.history.push(`/folder/${note.folder_id}`)
      })
      .catch(error => {
        console.error({ error })
      })
  }

  render() {
    const { folders = [] } = this.context
    return (
      <section className='AddNote'>
        <h2>Create a note</h2>
        <NotefulForm onSubmit={this.handleSubmit}>
          <div className='field'>
            <label htmlFor='note-title-input'>
              Title
            </label>
            <input type='text' id='note-title-input' name='note-title' required onChange={e => this.updateTitle(e.target.value)} />
            <ValidationError hasError={!this.state.titleValid} message={this.state.validationMessages.title} />
          </div>
          <div className='field'>
            <label htmlFor='note-content-input'>
              Content
            </label>
            <textarea id='note-content-input' name='note-content' required onChange={e =>
              this.updateContent(e.target.value)} />
            <ValidationError hasError={!this.state.titleValid} message={this.state.validationMessages.content} />
          </div>
          <div className='field'>
            <label htmlFor='note-folder-select'>
              Folder
            </label>
            <select id='note-folder-select' name='note-folder-id' onChange={e => this.updateFolderId(e.target.value)}>
              <option value={null}>...</option>
              {folders.map(folder =>
                <option key={folder.id} value={folder.id}>
                  {folder.title}
                </option>
              )}
            </select>
            <ValidationError hasError={!this.state.folderIdValid} message={this.state.validationMessages.folderId} />
          </div>
          <div className='buttons'>
            {this.state.formValid && <button type='submit' >
              Add note
            </button>}
          </div>
        </NotefulForm>
      </section>
    )
  }
}
