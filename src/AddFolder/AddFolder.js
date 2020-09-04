/* eslint-disable no-useless-escape */
import React, { Component } from 'react'
import NotefulForm from '../NotefulForm/NotefulForm'
import ApiContext from '../ApiContext'
import config from '../config'
import './AddFolder.css'
import ValidationError from '../Validator'

export default class AddFolder extends Component {
  constructor(props) {
    super(props);
    this.state = {
      title: "",
      titleValid: false,
      formValid: false,
      validationMessages: {
        title: ""
      }
    }
  }
  isValid = function (str) {
    return !/[~`#$%\^&*+=\-\[\]\\';/{}|\\":<>\?]/g.test(str);
  }
  updateFoldertitle = (title) => {
    this.setState({ title }, () => { this.validatetitle(title) });
  }

  validatetitle = (fieldValue) => {
    const fieldErrors = { ...this.state.validationMessages };
    let hasError = false;

    fieldValue = fieldValue.trim();
    if (fieldValue.length === 0) {
      fieldErrors.title = 'Name is required';
      hasError = true;
    } if (!this.isValid(fieldValue)) {
      fieldErrors.title = 'Special Characters are not allowed.';
      hasError = true;
    }
    else {
      if (fieldValue.length < 3) {
        fieldErrors.title = 'Name must be at least 3 characters long';
        hasError = true;
      }
      else {
        fieldErrors.name = '';
        hasError = false;
      }
    }

    this.setState({
      validationMessages: fieldErrors,
      titleValid: !hasError
    }, this.validateForm);

  }

  validateForm = () => {
    this.setState({
      formValid: this.state.titleValid
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
    const folder = {
      title: e.target['folder-title'].value
    }
    fetch(`${config.API_ENDPOINT}/folders`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify(folder),
    })
      .then(res => {
        if (!res.ok)
          return res.json().then(e => Promise.reject(e))
        return res.json()
      })
      .then(folder => {
        this.context.addFolder(folder)
        this.props.history.push(`/folder/${folder.id}`)
      })
      .catch(error => {
        console.error({ error })
      })
  }

  render() {
    return (
      <section className='AddFolder'>
        <h2>Create a folder</h2>
        <NotefulForm onSubmit={this.handleSubmit}>
          <div className='field'>
            <label htmlFor='folder-title-input'>
              Title
            </label>
            <input type='text' id='folder-title-input' name='folder-title' onChange={e => this.updateFoldertitle(e.target.value)} />
            <ValidationError hasError={!this.state.titleValid} message={this.state.validationMessages.title} />
          </div>
          <div className='buttons'>
            {this.state.formValid && <button type='submit'>
              Add folder
            </button>}
          </div>
        </NotefulForm>
      </section>
    )
  }
}
