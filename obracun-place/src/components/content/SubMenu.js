import React from 'react';
import { Collapse, NavItem, NavLink } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import classNames from 'classnames';
import { NavLink as RRNavLink } from 'react-router-dom';

class SubMenu extends React.Component {
  constructor(props) {
    super(props);

    this.toggleNavbar = this.toggleNavbar.bind(this);
    this.state = {
      collapsed: true
    };
  }

  toggleNavbar() {
    this.setState({
      collapsed: !this.state.collapsed
    });
  }
  render() {
    const { icon, title, items } = this.props;
    return (
      <div>
        <NavItem onClick={this.toggleNavbar} className={classNames({ 'menu-open': !this.state.collapsed })}>
          <NavLink className="dropdown-toggle" href="#"><span className="sidebar-icon"><FontAwesomeIcon icon={icon} className="mr-2" /></span><span style={{ display: 'inline-block', width: '170px' }}>{title}</span></NavLink>
        </NavItem>
        <Collapse isOpen={!this.state.collapsed} navbar className={classNames('items-menu', { 'mb-1': !this.state.collapsed })}>
          {items.map((item, index) => {
            return <NavItem key={index} className="pl-4">
              <NavLink to={item.link} activeClassName="activeLink" tag={RRNavLink}><FontAwesomeIcon icon={item.icon} className="mr-2" />{item.title}</NavLink>
            </NavItem>
          })}
        </Collapse>
      </div>
    );
  }
}

export default SubMenu;
