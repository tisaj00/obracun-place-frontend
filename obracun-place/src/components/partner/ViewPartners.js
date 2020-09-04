import React, { Component } from 'react';
import { Container, Button, Spinner, Modal, ModalHeader, ModalBody, ModalFooter, } from 'reactstrap';
import { Link, withRouter } from 'react-router-dom';
import { withCookies } from 'react-cookie';
import { withToastManager } from 'react-toast-notifications';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTimesCircle, faPlus } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import DataTable from 'react-data-table-component';

class ViewPartners extends Component {

  emptyPartner = {
    id: '',
    name: '',
    oib: '',
    location: '',
    description: '',
    city: ''
  };

  constructor(props) {
    super(props);
    const { cookies, toastManager } = props;
    this.state = {
      initialPartner: this.emptyPartner,
      xsrfToken: cookies.get('XSRF-TOKEN'),
      isLoading: false,
      partners: [],
      modal: false,
      partnerTodelete: this.emptyPartner
    };
    this.toastManager = toastManager;
    this.openDialog = this.openDialog.bind(this);
    this.closeDialog = this.closeDialog.bind(this);
    this.deletePartner = this.deletePartner.bind(this);
  }

  openDialog = (row) => {
    this.setState({ modal: !this.state.modal, partnerTodelete: row });
  }

  closeDialog() {
    this.setState({ modal: false });
  }

  async componentDidMount() {
    this.setState({ isLoading: true });
    this.getAllPartners(0, 10);
  }

  async onChangePage(page, size) {
    await this.getAllPartners(page - 1, this.state.size);
  }

  async onChangeRowsPerPage(currentRowsPerPage, currentPage) {
    await this.getAllPartners(currentPage - 1, currentRowsPerPage);
  }

  async deletePartner() {
    this.setState({ isLoading: true });
    await axios.delete(`http://localhost:9088/partner/delete/${this.state.partnerTodelete.id}`, {
      headers: {
        'Accept': 'application/json'
      },
      withCredentials: true
    })
      .then(response => {
        if (response.status !== 200) {
          this.toastManager.add("Undefined error in API: " + response.status, {
            appearance: 'error', autoDismiss: true, autoDismissTimeout: 3000
          });
        } else {
          let updatedpartners = [...this.state.partners].filter(i => i.id !== this.state.partnerTodelete.id);
          this.setState({ partners: updatedpartners, isLoading: false, modal: false },
            () => this.toastManager.add("Partner deleted successfully.", {
              appearance: 'success', autoDismiss: true, autoDismissTimeout: 3000
            }));
        }
      })
      .catch(error => {
        this.setState({ isLoading: false },
          () => this.toastManager.add("PartnerDelete " + error.response.status + " " + error.response.statusText, {
            appearance: 'error', autoDismiss: true, autoDismissTimeout: 3000
          }));
      })
  }

  async getAllPartners(page, size) {

    await axios.get('http://localhost:9088/partner/all?&page=' + page + '&size=' + size, {
      headers: {
        'Accept': 'application/json'
      },
      withCredentials: true
    })
      .then(response => {
        if (response.status !== 200) {
          this.setState({ isLoading: false },
            this.toastManager.add("Undefined error in API: " + response.status, {
              appearance: 'error', autoDismiss: true, autoDismissTimeout: 3000
            }));
        } else {
          console.log(response.data.content)
          this.setState({
            partners: response.data.content,
            totalElements: response.data.totalElements,
            totalPages: response.data.totalPages,
            size: response.data.size,
            isLoading: false,
          })
        }
      })
      .catch(error => {
        this.setState({ isLoading: false },
          this.toastManager.add("getPartners " + error.response.status + " " + error.response.statusText, {
            appearance: 'error', autoDismiss: true, autoDismissTimeout: 10000
          }));
      })
  }


  render() {
    const { partners, isLoading, modal, partnerTodelete } = this.state;

    if (isLoading) {
      return (
        <div className="loading-position">
          <Spinner className="grow" color="success" />
        </div>
      )
    }
    const deleteModal = <Modal isOpen={modal} centered>
      <ModalHeader>Deleting a Partner</ModalHeader>
      <ModalBody>
        Are you sure you want to delete partner {partnerTodelete.name} with OIB :{partnerTodelete.oib} ?
            </ModalBody>
      <ModalFooter>
        <Button color="danger" onClick={this.closeDialog}>Cancel</Button>
        <Button color="success" onClick={this.deletePartner}>Delete Partner</Button>{' '}
      </ModalFooter>
    </Modal>

    const partnersColumns = [
      {
        name: "Name",
        selector: "name",
        sortable: true,
        width: "20%"

      },
      {
        name: "Oib",
        selector: "oib",
        sortable: true,
        width: "15%"
      },
      {
        name: "Location",
        selector: "location",
        sortable: true,
        width: "15%"
      },
      {
        name: "Description",
        selector: "description",
        sortable: true,
        width: "20%"
      },
      {
        name: "City",
        selector: "city.name",
        sortable: true,
        width: "15%"
      },
      {
        name: "Action",
        selector: "action",
        width: "15%",
        cell: row => <span>
          <Button size="sm" color="success" tag={Link} to={{ pathname: "/partner/" + row.id }}><FontAwesomeIcon icon={faEdit} />{' '}Edit</Button>{' '}
          <Button size="sm" color="warning" onClick={() => this.openDialog(row)}><FontAwesomeIcon icon={faTimesCircle} />{' '}Delete</Button>{' '}
        </span>
      }
    ]

    return (
      <div>
        <Container fluid>
          <div className="float-right">
            <Button color="success" tag={Link} to="/partner"><FontAwesomeIcon icon={faPlus} /> Create Partner</Button>
          </div>
          <h3 >View Partners</h3>
          {deleteModal}

          <DataTable
            noHeader={true}
            columns={partnersColumns}
            data={partners}
            highlightOnHover
            pagination
            paginationServer
            paginationRowsPerPageOptions={[5, 10, 15, 20]}
            paginationTotalRows={this.state.totalElements}
            onChangePage={(page, totalRows) => this.onChangePage(page, totalRows)}
            onChangeRowsPerPage={(currentRowsPerPage, currentPage) => this.onChangeRowsPerPage(currentRowsPerPage, currentPage)}
          />
        </Container>
      </div>
    );
  }
}

export default withToastManager(withCookies(withRouter(ViewPartners)));