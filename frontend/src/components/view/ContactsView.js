import React, { Component } from 'react';
import { Button, InputGroup, FormControl } from "react-bootstrap";
import InfiniteScroll from "react-infinite-scroll-component";
//import ContactView from './ContactView'

import axios from "axios";
import './style.css'
import './ContactView.css'

function updateId(id) {
	this.setState({id: id, isEdit: false}, () => {
		this.grabUserData()
	})
}

function makeNewContact() {
	this.setState({id: null, isEdit: true}, () => {
		this.resetForms()
	})
}

function sortedIndex(items, contact) {
    var low = 0,
        high = items.length;

    while (low < high) {
        var mid = (low + high) >>> 1;
        if (items[mid].name < contact.name) low = mid + 1;
        else high = mid;
	}
	
    return low;
}

function add(items, contact, index) {
	var tarray = [...items]
	tarray.splice(index,0,contact)
	return tarray;
}

function Title(props) {
	const isNew = props.id === null;
	if (isNew) {
		return <h1>New Contact</h1>
	} else {
		return <h1></h1>
	}
}

function SubmitButton(props) {
  const isNew = props.id === null;
  if (isNew) {
    return <div onClick={props.onChange} className="col">
      <Button className="col-6 btn btn-primary">Create</Button>
    </div>
  }

  return <div onClick={props.onChange} className="col">
      <Button className="col-6 btn btn-primary">Done</Button>
    </div>
}

export default class ContactsView extends Component {

  constructor(props) {
	 super(props);
	 
     this.state = {
         items: [],
			hasMore: true,
			doNewSearch: true,
			offset: 0,
			name: '',
			searchName: '',
			selectedId: null,
     };

     // bind function in constructor instead of render (https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/jsx-no-bind.md)
	  this.onChangePage = this.onChangePage.bind(this);
	  this.handleCardSelect = this.handleCardSelect.bind(this);
	  this.deleteContact = this.deleteContact
  }

  deleteContact = (id) => {
	  this.setState({
		  items: this.state.items.filter(contact => contact._id !== id)
	  })
  }

	componentDidMount() {
		this.grabContacts(0);
	}

	updateId = id => {
		this.setState({
			 id: id
		})
  }

	grabContacts = () => {
		const { offset } = this.state;
		const limit = 40;
		
		axios.get(`/api/contacts`, {
			params: {
				name: this.state.searchName,
				offset: offset,
				limit: limit
			}
		})
		.then(response => {
			const data = response.data.data;
			const { doNewSearch } = this.state;

			if (doNewSearch) {
				this.setState({
					items: data,
					doNewSearch: false,
					offset: data.length+1,
					hasMore: response.data.hasMore
				})
			} else {
				this.setState({
					items: [...this.state.items, data],
					offset: data.length+1,
					hasMore: response.data.hasMore
				})
			}
		})
		.catch(error => {
		})
	}

  onChangePage(pageOfItems) {
    // update state with new page of items
    this.setState({ pageOfItems: pageOfItems });
  }

	editContact = (contact) => {
		const nitems = this.state.items.map(tcontact => {
			if (tcontact._id === contact._id) {
				return contact;	
			}

			return tcontact;
		})
		this.setState({
			items: nitems
		})
	}

	addContact = (contact) => {
		const index = sortedIndex(this.state.items, contact)
		this.setState({
			items: add(this.state.items, contact, index)
		})
	}

  handleScrollUpdate = event => {
	  this.setState({
		  doNewSearch: false
	  }, () => {
		  this.grabContacts(this.state.offset)
	  })
  }

	handleSearchChange = event => {
		this.setState({
			searchName: event.target.value,
			doNewSearch: true,
			offset: 0,
		}, () => {
			this.grabContacts()
		})
	}

	handleNameChange = event => {
		this.setState({
			name: event.target.value
		});
	}

	handleCardSelect (id) {
		updateId(id);
  }
  
  handleMakeNewContact() {
    makeNewContact();
  }

  render() {
    return (
      <div className="whole" style={{ backgroundColor: "#f8f9fa"}}>
        <div className="leftHalf" style={{ paddingTop: "2%", height: "100%", overflowY: "scroll", background: "#f8f9fa"}}>
          <div className="container-fluid">
            <InputGroup className="mb-3">
              <FormControl
                className="form-control"
                type="texts"
                placeholder="Search Contact"
                value={this.state.searchName}
                onChange={this.handleSearchChange}
              />
              <InputGroup.Append>
                    <Button onClick={this.handleMakeNewContact} className="butt" variant="outline-primary" size="sm">+</Button>
              </InputGroup.Append>
            </InputGroup>
            <hr/>

            <div id="scrollableDiv" className="smooth-scroll" style={{ height: "100%", backgroundColor: "#f8f9fa"}}>
              <InfiniteScroll
                dataLength={this.state.items.length}
                next={this.grabContacts}
                hasMore={this.state.hasMore}
                scrollableTarget="scrollableDiv"
                >

                {this.state.items.map(item =>
                  <div 
                    style={{backgroundColor: "transparent"}}
                    key={item._id} 
                    className="contact-card container"
                    onClick={this.handleCardSelect.bind(this, item._id)}
                  
                  >
                    <div class="card" style={{background: "transparent"}}>
                      <div class="row no-gutters">
                        <div class="col-2" style={{background: "gray"}}>
                          <img className="card-image contact-icon rounded-circle" src="/default.png" />
                        </div>
                        <div class="col-8">
                          <div class="flex-row text-left">
                            <div class="col">
                              <b className="card-text">{item.name + " " + item.last}</b>
                            </div>
                            <div class="col">
                              <label size="sm" className="card-text text-muted">{item.company}</label>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <hr/>
                  </div>
                )}

              </InfiniteScroll>
            </div>
          </div>
        </div>
        <div className="rightHalf" style={{ paddingTop: "2%",}}>
          <ContactView makeNewContact={this.makeNewContact} addContact={this.addContact} editContact={this.editContact} deleteContact={this.deleteContact} updateId={this.updateId}/>
        </div>
      </div>
    );
	}
}

export class ContactView extends Component {

	constructor(props) {
		 super(props);

		 this.state = {
      name: '',
      last: '',
			cell_phone_number: '',
			home_address: '',
			birthday: '',
			note: '',
			email: '',
			company: '',
			isEdit: true,

			id: null,
		 };

     updateId = updateId.bind(this);
     makeNewContact = makeNewContact.bind(this);
	}

	grabUserData() {
		 axios.get(`/api/contact/${this.state.id}`)
		 .then(response => {
			  const data = response.data.data;
			  this.setState({
          name: data.name,
          last: data.last,
					cell_phone_number: data.cell_phone_number,
					home_address: data.home_address,
					birthday: data.birthday,
					note: data.note,
					email: data.email,
					company: data.company,
			  })
		 })
		 .catch(error => {
		 })
	}

	editUserData = event => {


		const data = {
			name: this.state.name,
				cell_phone_number: this.state.cell_phone_number,
				home_address: this.state.home_address,
				birthday: this.state.birthday,
				note: this.state.note,
				email: this.state.email,
        company: this.state.company,
        last: this.state.last,
		}

		// Creating new contact
		if (!this.state.id) {
			axios.post('/api/contact', data)
			.then(response => {

				const data = response.data.data

				this.setState({
					id: data._id,
					isEdit: false,
				})

				this.props.addContact(data)

			})
			.catch(error => {
			})

		// Editing contact
		} else {
			axios.put(`/api/contact/${this.state.id}`, data)
			.then(response => {

				data._id = this.state.id

				this.props.editContact(data)
				this.setState({
					isEdit: false,
				})

			})
			.catch(error => {
			})
		}
	}

	handleNameChange = event => {
		this.setState({
			 name: event.target.value
		})
	}

	handleEmailChange = event => {
		 this.setState({
			  email: event.target.value
		 })
	}

	handleNumberChange = event => {
		this.setState({
			 cell_phone_number: event.target.value
		})
	}

	handleNoteChange = event => {
		this.setState({
			note: event.target.value
		})
	}

	handleCompanyChange = event => {
		this.setState({
			company: event.target.value
		})
	}

	handleBirthdayChange = event => {
		this.setState({
			birthday: event.target.value
		})
	}

	handleAddressChange = event => {
		this.setState({
			home_address: event.target.value
		})
  }
  
  handlelastChange = event => {
		this.setState({
			last: event.target.value
		})
	}

	onEditClick = event => {
		this.setState({
			isEdit: true
		})
	}

	deleteContact(id) {
	  axios.delete(`/api/contact/${id}`)
	  .then(response => {
		  if (response.data.success) {
			  const id = this.state.id;
			  this.setState({
        name: '',
        last: '',
				cell_phone_number: '',
				home_address: '',
				birthday: '',
				note: '',
				email: '',
				company: '',
				isEdit: true,
				id: null,

			  }, () => {
				  this.props.deleteContact(id)
			  });
		  }
	  })
	  .catch(error => {
	  })
  }

	resetForms = event => {
		this.setState({
      name: '',
      last: '',
      cell_phone_number: '',
      home_address: '',
      birthday: '',
      note: '',
      email: '',
      company: '',
		})
	}

	render() {

		 const { isEdit, isDeleted } = this.state;

		if (isEdit || isDeleted) {

			return (
        <div className="container bg-light text-dark">
          <div className="row justify-content-center align-items-center">
            <div className="col text-center image-section">
              <img className="card-image contact-icon2 rounded-circle" src="/default.png" />
            </div>
          </div>
          <hr/>
          <div className="row justify-content-center align-items-center">
            <div className="col col-sm-6 col-md-6 col-lg-4 col-xl-7">
              <form action="">
                <hr/>
                <div className="form-row" style={{display: "flex", alignItems: "center" }}>
                  <div className="col-2">
                    <label>First Name:</label>
                  </div>
                  <div className="col-3">
                    <input 
                      type="texts" 
                      className="form-control" 
                      placeholder="John"
                      value={this.state.name}
                      onChange={this.handleNameChange}
                    />
                  </div>
                  <div className="col-3">
                    <label>Last Name:</label>
                  </div>
                  <div className="col-4">
                    <input 
                      type="texts" 
                      className="form-control" 
                      placeholder="Doe"
                      value={this.state.last}
                      onChange={this.handlelastChange}
                    />
                  </div>
                </div>
                <hr/>
                <div className="form-row" style={{display: "flex", alignItems: "center" }}>
                  <div className="col-4">
                    <label>Company:</label>
                  </div>
                  <div className="col">
                    <input 
                      type="texts" 
                      className="form-control" 
                      placeholder="UCF CS College"
                      value={this.state.company}
                      onChange={this.handleCompanyChange}
                    />
                  </div>
                </div>
                <hr/>
                <div className="form-row" style={{display: "flex", alignItems: "center" }}>
                  <div className="col-4">
                    <label>Mobile:</label>
                  </div>
                  <div className="col">
                    <input 
                      type="tel" 
                      className="form-control" 
                      placeholder="+1-(123)-456-7890"
                      value={this.state.cell_phone_number}
                      onChange={this.handleNumberChange}
                    />
                  </div>
                </div>
                {/*
                <div className="form-row">
                  <div className="col-4">
                    <label>Phone:</label>
                  </div>
                  <div className="col">
                    <input type="tel" className="form-control" placeholder="+1-(123)-456-7890" />
                  </div>
                </div>
                */}
                <hr/>
                <div className="form-row" style={{display: "flex", alignItems: "center" }}>
                  <div className="col-4">
                    <label>Email:</label>
                  </div>
                  <div className="col">
                    <input 
                      type="email" 
                      className="form-control" 
                      placeholder="example@email.com"
                      value={this.state.email}
                      onChange={this.handleEmailChange}
                    />
                  </div>
                </div>
                <hr/>
                <div className="form-row" style={{display: "flex", alignItems: "center" }}>
                  <div className="col-4">
                    <label>Home Address:</label>
                  </div>
                  <div className="col">
                    <input 
                      type="texts" 
                      className="form-control" 
                      placeholder="4000 Central Florida Blvd, Orlando, FL 32816"
                      value={this.state.home_address}
                      onChange={this.handleAddressChange}
                    />
                  </div>
                </div>
                <hr/>
                <div className="form-row" style={{display: "flex", alignItems: "center" }}>
                  <div className="col-4">
                    <label>Birthday:</label>
                  </div>
                  <div className="col">
                    <input 
                      type="date" 
                      className="form-control" 
                      placeholder="February 4, 2020" 
                      value={this.state.birthday}
                      onChange={this.handleBirthdayChange}
                    />
                  </div>
                </div>
                <hr/>
                <div className="form-row" style={{display: "flex", alignItems: "center" }}>
                  <div className="col-4">
                    <label>Note:</label>
                  </div>
                  <div className="col">
                    <textarea 
                      type="text" 
                      className="form-control" 
                      placeholder="This is a cool guy." 
                      value={this.state.note}
                      onChange={this.handleNoteChange}
                    />
                  </div>
                </div>
                <hr/>
                <div className="form-group">
                  <div className="container">
                    <div className="row">
                      <div className="col"><Button variant="danger" onClick={this.resetForms} className="col-6 btn btn-secondary">Reset</Button></div>
                      <SubmitButton onChange={this.editUserData} id={this.state.id} />
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
			)
		}

		 return (
      <div className="container-fluid h-100 bg-light text-dark">
      <Title id={this.state.id}/>
      <div className="row justify-content-center align-items-center">
        <div className="col text-center image-section">
          <img className="card-image contact-icon2 rounded-circle" src="/default.png" />
          <h1>{this.state.name + ' ' + this.state.last || ''}</h1>
        </div>
      </div>
      <hr/>
      <div className="row justify-content-center align-items-center h-100">
        <div className="col col-sm-6 col-md-6 col-lg-4 col-xl-7">
          <form action="">
            <hr/>
            <div className="form-row">
              <div className="col-4">
                <label>Company:</label>
              </div>
              <div className="col">
                <b>{this.state.company}</b>
              </div>
            </div>
            <hr/>
            <div className="form-row">
              <div className="col-4">
                <label>Mobile:</label>
              </div>
              <div className="col">
                <b>{this.state.cell_phone_number}</b>
              </div>
            </div>
            {/*
            <div className="form-row">
              <div className="col-4">
                <label>Phone:</label>
              </div>
              <div className="col">
                <input type="tel" className="form-control" placeholder="+1-(123)-456-7890" />
              </div>
            </div>
            */}
            <hr/>
            <div className="form-row">
              <div className="col-4">
                <label>Email:</label>
              </div>
              <div className="col">
                <b>{this.state.email}</b>
              </div>
            </div>
            <hr/>
            <div className="form-row">
              <div className="col-4">
                <label>Home Address:</label>
              </div>
              <div className="col">
                <b>{this.state.home_address}</b>
              </div>
            </div>
            <hr/>
            <div className="form-row">
              <div className="col-4">
                <label>Birthday:</label>
              </div>
              <div className="col">
                <b>{this.state.birthday}</b>
              </div>
            </div>
            <hr/>
            <div className="form-row">
              <div className="col-4">
                <label>Note:</label>
              </div>
              <div className="col">
                <textarea
                  readonly
                  type="text" 
                  className="form-control" 
                  value={this.state.note}
                />
              </div>
            </div>
            <hr/>
            <div className="form-group">
              <div className="container">
                <div className="row">
                  <div className="col"><Button variant="danger" onClick={this.deleteContact.bind(this, this.state.id)} className="col-6 btn btn-secondary">Delete</Button></div>
                  <div onClick={this.onEditClick} className="col"><Button className="col-6 btn btn-primary">Edit</Button></div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
			)
	}
}