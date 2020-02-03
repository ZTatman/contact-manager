import React, { Component } from 'react';
import ContactCard from './ContactCard'
import ContactPagination from './ContactPagination';
import { Button, Navbar, Card } from "react-bootstrap";
import { Form, FormGroup, Row, Col, Label, Input, FormFeedback } from 'reactstrap';

import ReactPaginate from 'react-paginate'

import { getContacts } from '../../actions/contactActions'
import axios from "axios";

import './style.css'
export class ContactsListView extends Component {

  constructor() {
    super();

     // an example array of 150 items to be paged
     var exampleItems = [...Array(150).keys()].map(i => ({ id: (i+1), name: 'Item ' + (i+1) }));

     this.state = {
         exampleItems: exampleItems,
         pageOfItems: [],
         name: '',
     };

     // bind function in constructor instead of render (https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/jsx-no-bind.md)
	  this.onChangePage = this.onChangePage.bind(this);
	  this.deleteContact = this.deleteContact.bind(this);
  }

  componentDidMount() {
    this.grabContacts();
  }

  deleteContact(id) {
		axios.delete(`/api/contact/${id}`)
		.then(response => {
			console.log('delete attempt.')
			if (response.data.success) {
				console.log('delete success.')
				this.setState(prevState => ({
					exampleItems: prevState.exampleItems.filter(contact => contact._id != id)
				}));
			}
		})
		.catch(error => {
			console.log(error.response)
		})
  }

  grabContacts() {
    console.log('test')
    axios.get('/api/contacts')
    .then(response => {
      console.log(response)
      if (response) {
        const data = response.data.data;
        console.log(data)
        this.setState({
          exampleItems: data,
        })
      }
    })
    .catch(error => {
      console.log(error)
    })
  }

  onChangePage(pageOfItems) {
    // update state with new page of items
    this.setState({ pageOfItems: pageOfItems });
  }

  addContact = event => {
    axios.put('/api/contact', { name: this.state.name, cell_phone_number: 'test' })
    .then(response => {
		const data = response.data.data
      this.setState({
        exampleItems: [...this.state.exampleItems, { name: data.name, _id: data._id } ],
      })
    })
    .catch(error => {
      console.log(error.response.data)
    })
  }

  handleNameChange = event => {
    this.setState({
      name: event.target.value
    })
  }

  render() {
    return (
        <div>
            <div className="container">
              <div>
                <FormGroup>
                  <Input
                    name="firstName"
                    className="input"
                    type="text"
                    placeholder="First Name"
                    value={this.state.name}
                    onChange={this.handleNameChange}
                  />
                </FormGroup>

                <Button onClick={this.addContact}>Add user</Button>

					</div>
						<div className="text-center">
							<h1>React - Pagination Example with logic like Google</h1>
							{this.state.pageOfItems.map(item =>
								<div>
									<b key={item._id}>{item.name}</b>
									<Button onClick={this.deleteContact.bind(this, item._id)}>Delete Contact</Button>
								</div>
							)}
							<Pagination items={this.state.exampleItems} onChangePage={this.onChangePage} />
						</div>
            </div>
            <hr />
        </div>
    );
}
}

const defaultProps = {
  initialPage: 1,
  pageSize: 10
}

class Pagination extends React.Component {
  constructor(props) {
      super(props);
      this.state = { pager: {} };
  }

  componentWillMount() {
      // set page if items array isn't empty
      if (this.props.items && this.props.items.length) {
          this.setPage(this.props.initialPage);
      }
  }

  componentDidUpdate(prevProps, prevState) {
      // reset page if items array has changed
      if (this.props.items !== prevProps.items) {
          this.setPage(this.props.initialPage);
      }
  }

  setPage(page) {
      var { items, pageSize } = this.props;
      var pager = this.state.pager;

      if (page < 1 || page > pager.totalPages) {
          return;
      }

      // get new pager object for specified page
      pager = this.getPager(items.length, page, pageSize);

      // get new page of items from items array
      var pageOfItems = items.slice(pager.startIndex, pager.endIndex + 1);

      // update state
      this.setState({ pager: pager });

      // call change page function in parent component
      this.props.onChangePage(pageOfItems);
  }

  getPager(totalItems, currentPage, pageSize) {
      // default to first page
      currentPage = currentPage || 1;

      // default page size is 10
      pageSize = pageSize || 10;

      // calculate total pages
      var totalPages = Math.ceil(totalItems / pageSize);

      var startPage, endPage;
      if (totalPages <= 10) {
          // less than 10 total pages so show all
          startPage = 1;
          endPage = totalPages;
      } else {
          // more than 10 total pages so calculate start and end pages
          if (currentPage <= 6) {
              startPage = 1;
              endPage = 10;
          } else if (currentPage + 4 >= totalPages) {
              startPage = totalPages - 9;
              endPage = totalPages;
          } else {
              startPage = currentPage - 5;
              endPage = currentPage + 4;
          }
      }

      // calculate start and end item indexes
      var startIndex = (currentPage - 1) * pageSize;
      var endIndex = Math.min(startIndex + pageSize - 1, totalItems - 1);

      // create an array of pages to ng-repeat in the pager control
      var pages = [...Array((endPage + 1) - startPage).keys()].map(i => startPage + i);

      // return object with all pager properties required by the view
      return {
          totalItems: totalItems,
          currentPage: currentPage,
          pageSize: pageSize,
          totalPages: totalPages,
          startPage: startPage,
          endPage: endPage,
          startIndex: startIndex,
          endIndex: endIndex,
          pages: pages
      };
  }

  render() {
      var pager = this.state.pager;

      if (!pager.pages || pager.pages.length <= 1) {
          // don't display pager if there is only 1 page
          return null;
      }

      return (
          <ul className="pagination">
              <li className={pager.currentPage === 1 ? 'disabled' : ''}>
                  <a onClick={() => this.setPage(1)}>First</a>
              </li>
              <li className={pager.currentPage === 1 ? 'disabled' : ''}>
                  <a onClick={() => this.setPage(pager.currentPage - 1)}>Previous</a>
              </li>
              {pager.pages.map((page, index) =>
                  <li key={index} className={pager.currentPage === page ? 'active' : ''}>
                      <a onClick={() => this.setPage(page)}>{page}</a>
                  </li>
              )}
              <li className={pager.currentPage === pager.totalPages ? 'disabled' : ''}>
                  <a onClick={() => this.setPage(pager.currentPage + 1)}>Next</a>
              </li>
              <li className={pager.currentPage === pager.totalPages ? 'disabled' : ''}>
                  <a onClick={() => this.setPage(pager.totalPages)}>Last</a>
              </li>
          </ul>
      );
  }
}

class ContactsView extends Component {

    state = {
        allContacts: [],
        currentContacts: [],
        currentPage: null,
        totalPages: null
      };
    
      componentDidMount() {
        getContacts(allContacts => {
          this.setState({ allContacts });
        });
      }

      handleAddUser = event => {   
        console.log('hmmm')
        axios.put('/api/contact', { 
          name: "Cool", 
          cell_phone_number: "hm" 
        })
        .then(response => {
          console.log(response.data)
          if (response.data.success) {
            this.state.allContacts.push(response.data)
          }
        })
        .catch(error => {
          console.log(error)
        })
      }
    
      onPageChanged = data => {
        const { allContacts } = this.state;
        const { currentPage, totalPages, pageLimit } = data;
        const offset = (currentPage - 1) * pageLimit;
        const currentContacts = allContacts.slice(offset, offset + pageLimit);
    
        this.setState({ currentPage, currentContacts, totalPages });
      };
    
      render() {

        const navLinkStyle = {
          color: "white",
          textDecoration: "none",
          fontWeight: "bold",
        };

        const {
          allContacts,
          currentContacts,
          currentPage,
          totalPages
        } = this.state;
        const totalContacts = allContacts.length;
        
        const headerClass = [
          "text-dark py-2 pr-4 m-0",
          currentPage ? "border-gray border-right" : ""
        ]
          .join(" ")
          .trim();
    
        return (
          <div>
            <Navbar bg="dark" variant="dark">
              <Navbar.Brand
                className="justify-content-left"
                style={navLinkStyle}
                href="/"
              >
                <img className="icon" src="/coolbeans.png" />
              </Navbar.Brand>
              <Navbar.Collapse className="dark-navbar justify-content-end"></Navbar.Collapse>
              <Button onClick={this.handleLogout} variant="outline-success" className="loginButton">Logout</Button>
            </Navbar>
            
            <div className="container">
              <div className="name">
                Hello, {this.state.user}
              </div>
            </div>
            
            <div className="container mb-5">
              <div className="row d-flex flex-row py-5">
                <div className="w-100 px-4 py-5 d-flex flex-row flex-wrap align-items-center justify-content-between">
                  <div className="d-flex flex-row align-items-center">
                          <Button onClick={this.handleAddUser}>Add user</Button>
                    <h2 className={headerClass}>
                      <strong className="text-secondary">{totalContacts}</strong>{" "}
                      Contacts
                    </h2>
                    {currentPage && (
                      <span className="current-page d-inline-block h-100 pl-4 text-secondary">
                        Page <span className="font-weight-bold">{currentPage}</span> /{" "}
                        <span className="font-weight-bold">{totalPages}</span>
                      </span>
                    )}
                  </div>
                  <div className="d-flex flex-row py-4 align-items-center">
                    <ContactPagination
                      totalRecords={totalContacts}
                      pageLimit={10}
                      pageNeighbours={1}
                      onPageChanged={this.onPageChanged}
                    />
                  </div>
                </div>
                {currentContacts.filter(contact => contact !== null).map(contact => (
                  <ContactCard name={contact.name} />
                ))}
              </div>
            </div>
          </div>
        );
      }
}