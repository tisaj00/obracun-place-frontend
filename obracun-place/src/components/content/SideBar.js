import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {  faList,  faPlus,  faHandshake,  faAddressCard, faFileContract, faCalculator, faHome, faReceipt } from '@fortawesome/free-solid-svg-icons';
import { NavItem, NavLink, Nav } from 'reactstrap';
import classNames from 'classnames';
import SubMenu from './SubMenu';
import {  Link } from 'react-router-dom';

class SideBar extends React.Component {
  constructor(props) {
    super(props);
    const { parentState } = props;
    this.parentState = parentState;
  }

  render() {
    let studentsItems = [];
    let receiptsItems = [];
    let calculationItems = [];
    let contractsItems = [];
    let partnerItems = [];

    studentsItems = [
      { link: "/student", icon: faPlus, title: "Create Student" },
      { link: "/students", icon: faList, title: "View Students" }];
    receiptsItems = [
      { link: "/receipt", icon: faPlus, title: "Create Receipt" },
      { link: "/receipts", icon: faList, title: "View Receipts" }];
    partnerItems = [
      { link: "/partner", icon: faPlus, title: "Create Partner" },
      { link: "/partners", icon: faList, title: "View Partners" }];
    contractsItems = [
      { link: "/contract", icon: faPlus, title: "Create Contract" },
      { link: "/contracts", icon: faList, title: "View Contracts" }];
    calculationItems = [
      { link: "/calculation", icon: faPlus, title: "Create Calculation" },
      { link: "/calculations", icon: faList, title: "View Calculations" }];
    return (
      <div className={classNames('sidebar', { 'is-open': this.props.isOpen })}>
        <div className="sidebar-header">
          <h3 style={{ textAlign: 'center' }}>Studentski Servis diplomski rad</h3>
        </div>
        <Nav vertical className="list-unstyled pb-3">
          <NavItem>
            <NavLink tag={Link} to="/home"><span className="sidebar-icon"><FontAwesomeIcon icon={faHome} className="mr-2" /></span>Home</NavLink>
          </NavItem>
          <SubMenu title="Student" icon={faAddressCard} items={studentsItems} />
          <SubMenu title="Partner" icon={faHandshake} items={partnerItems} />
          <SubMenu title="Contract" icon={faFileContract} items={contractsItems} />
          <SubMenu title="Calculation" icon={faCalculator} items={calculationItems} />
          <SubMenu title="Receipt" icon={faReceipt} items={receiptsItems} />
        </Nav>
      </div>
    );
  }
}

export default SideBar;
