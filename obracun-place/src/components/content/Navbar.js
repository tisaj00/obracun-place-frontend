import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAlignLeft, faUniversity } from '@fortawesome/free-solid-svg-icons';
import { Navbar, Button, NavbarToggler, Collapse, Nav, NavItem, NavLink } from 'reactstrap';
import { withCookies } from 'react-cookie';
import axios from "axios";

import { withRouter, Link } from 'react-router-dom';

class NavBar extends React.Component {

  state = {
    isOpen: false
  };

  constructor(props) {
    super(props);
    const { authFunc } = props;
    this.authFunc = authFunc;
    this.toggle = this.toggle.bind(this);
    this.logout = this.logout.bind(this);
  }

  toggle() {
    this.setState({
      isOpen: !this.state.isOpen  // navbar collapse
    });
  }

  async componentDidMount(){
    this.getRole()
  }

  async logout(event) {
    event.preventDefault();
    localStorage.removeItem('jwt');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    delete axios.defaults.headers.common['Authorization'];
    this.authFunc(undefined);
  }

  async getRole() {
    const username = localStorage.getItem('username');
    await axios({
        method: 'POST',
        url: `/api/auth/${username}/admin`
    })
        .then(response => {
            if (response.status !== 200) {

            } else {
                console.log("ADMIN", response.data.isAdmin)
                this.setState({
                    isAdmin: response.data.isAdmin
                });
            }
        })
        .catch(error => {
        })
}

  render() {

    return (
      <Navbar color="light" light className="navbar shadow-sm p-3 mb-4 bg-white rounded" expand="md">
        <Button style={{ backgroundColor: "#28a84b" }} className="toggle-btn" onClick={this.props.toggle}>
          <FontAwesomeIcon icon={faAlignLeft} />
        </Button>

        <strong>
          Welcome, {localStorage.getItem('username')}! Your role: {localStorage.getItem('role')}
        </strong>
        <NavbarToggler onClick={this.toggle} />
        <Collapse isOpen={this.state.isOpen} navbar>
          <Nav className="ml-auto" navbar>
            <NavItem>
              <NavLink href="https://www.ferit.unios.hr/"><FontAwesomeIcon icon={faUniversity} style={{ "color": "green" }} /> FERIT</NavLink>
            </NavItem>
            <Button style={{ color: "green", backgroundColor: 'transparent', borderColor: 'white' }} onClick={this.logout}>Logout</Button>
          </Nav>
        </Collapse>
      </Navbar>
    );
  }
}

export default withCookies(withRouter(NavBar));
