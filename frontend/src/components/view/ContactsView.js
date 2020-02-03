import React, { Component } from 'react';
import ContactCard from './ContactCard'
import ContactPagination from './ContactPagination';
import { Button } from "react-bootstrap";


import { getContacts } from '../../actions/contactActions'
import axios from "axios";
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
        );
      }
}

export default ContactsView;