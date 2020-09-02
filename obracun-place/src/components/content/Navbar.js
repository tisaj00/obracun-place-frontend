import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAlignLeft, faUniversity } from '@fortawesome/free-solid-svg-icons';
import { Navbar, Button, NavbarToggler, Collapse, Nav, NavItem, NavLink} from 'reactstrap';
import { withCookies } from 'react-cookie';

import { withRouter, Link } from 'react-router-dom';

class NavBar extends React.Component {

    state = {
        isOpen: false
    };

    constructor(props) {
        super(props);
        // const { parentState } = props;
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
    async logout(event) {
      event.preventDefault();
      this.authFunc(undefined);
  }

    /* logout() {
        fetch('/api/logout', {
          method: 'POST', credentials: 'include',
          headers: { 'X-XSRF-TOKEN': this.state.csrfToken }
        })
          .then(response => {
            if (response.ok) {
              this.setState({ error: undefined })
              this.authFunc(undefined);
              this.props.context.setProfile(undefined);
              this.props.context.setTags(undefined);
              window.location.href("/");
            } else {
              let error = {
                status: response.status,
                errorText: "Undefined error in API: ",
                body: response
              };
              this.setState({ error: error });
            }
          }).catch(error => {
            this.setState({ error: error });
          });
      } */

    render() {

        return (
            <Navbar color="light" light className="navbar shadow-sm p-3 mb-4 bg-white rounded" expand="md">
                <Button style={{ backgroundColor: "#28a84b" }} className="toggle-btn" onClick={this.props.toggle}>
                    <FontAwesomeIcon icon={faAlignLeft} />
                </Button>

                <strong>
                    Welcome, jtisaj{/* {this.state.user.name} ({this.state.user.user_name}) */}{/* ! Your role: SUPER_ADMIN */} {/* {this.state.user.roles[0]} */}
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
