import React, { Component } from 'react';
import { Container, Row, Col, Label, Input, Button, Dropdown, DropdownToggle, DropdownMenu, DropdownItem, Spinner, Modal, ModalHeader, ModalBody, ModalFooter, } from 'reactstrap';
import { Link, withRouter } from 'react-router-dom';
import { withCookies } from 'react-cookie';
import { withToastManager } from 'react-toast-notifications';
import axios from 'axios';
import moment from 'moment';
import { faFilePdf, faArchive, faReceipt } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import DataTable from 'react-data-table-component';

class ViewReceipts extends Component {

  emptyReceipt = {
    id: null,
    receiptNumber: '',
    date: null,
    maturity: null,
    neto: '',
    status: '',
    calculation: {
      id: null,

    }
  };

  statusChange = {
    id: null,
    status: ''
  }

  constructor(props) {
    super(props);
    const { cookies, toastManager } = props;
    this.state = {
      xsrfToken: cookies.get('XSRF-TOKEN'),
      isLoading: false,
      receipts: [],
      receipt: this.emptyReceipt,
      modal: false,
      statusDropdown: false,
      statusFilter: "SVI",
      statusChange: this.statusChange,
      toast: {
        error: {
          message: "Failed to export",
          options: {
            appearance: 'error',
            autoDismiss: true,
            autoDismissTimeout: 3000
          }
        },
      },
    };
    this.toastManager = toastManager;
    this.closeDialog = this.closeDialog.bind(this);
    this.openDialog = this.openDialog.bind(this);
    this.statusChangeReceipt = this.statusChangeReceipt.bind(this);
    this.toggleStatusDropdown = this.toggleStatusDropdown.bind(this);
    this.handleStatusFilterChange = this.handleStatusFilterChange.bind(this);
  }


  handleChange = (event) => {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;

    let statusChange = { ...this.state.statusChange }
    if (name === 'status' && value) {
      statusChange.status = value;
    } else {
      statusChange[name] = value;
    }
    this.setState({ statusChange: statusChange });

  }

  async componentDidMount() {
    this.setState({ isLoading: true });
    this.getReceipts(0, 10);
  }

  async onChangePage(page, size) {
    await this.getReceipts(page - 1, this.state.size);
  }

  async onChangeRowsPerPage(currentRowsPerPage, currentPage) {
    await this.getReceipts(currentPage - 1, currentRowsPerPage);
  }

  closeDialog() {
    this.setState({ modal: false, receipt: this.emptyReceipt });
  }

  openDialog = (receipt) => {
    this.setState({ modal: !this.state.modal, statusChange: { ...this.state.statusChange, id: receipt.id }, statusChange: receipt });
  }

  toggleStatusDropdown = () => {
    this.setState({ statusDropdown: !this.state.statusDropdown });
  }

  handleStatusFilterChange = (status) => {
    this.setState({ statusFilter: status });
  }

  async statusChangeReceipt() {
    await axios({
      method: 'PUT',
      url: 'http://localhost:9088/api/v1/status/' + this.state.statusChange.id,
      headers: {
        'X-XSRF-TOKEN': this.state.xsrfToken,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      data: this.state.statusChange,
      withCredentials: true
    })

      .then(response => {
        if (response.status !== 200) {
          this.setState({ isLoading: false },
            () => this.toastManager.add("Undefined error in API: " + response.status, {
              appearance: 'error', autoDismiss: true, autoDismissTimeout: 3000
            }));
        } else {
          this.setState({ modal: false },
            () => this.toastManager.add("Status changed successfully.", {
              appearance: 'success', autoDismiss: true, autoDismissTimeout: 3000
            }));
          this.getReceipts(0, this.state.size);
        }
      })
      .catch(error => {
        this.setState({ isLoading: false },
          () => this.toastManager.add("Status changed " + error.response + " " + error.response, {
            appearance: 'error', autoDismiss: true, autoDismissTimeout: 10000
          }));
      })
  }

  createRequest(receipt) {
    return {
      receipt: {
        id: receipt.id,
        date: receipt.date,
        receiptNumber: receipt.receiptNumber,
        maturity: receipt.maturity,
        neto: receipt.neto
      },
      calculation: {
        calculationNumber: receipt.calculation.number,
        contractNumber: receipt.calculation.contract.contractNumber
      },
      partner: {
        name: receipt.calculation.contract.partner.name,
        oib: receipt.calculation.contract.partner.oib,
        location: receipt.calculation.contract.partner.location,
        city: receipt.calculation.contract.partner.city.name
      }
    };
  }

  async handleInvoicesRequest(receipt) {

    console.log(this.createRequest(receipt))
    await axios.post('http://localhost:9088/api/export/receipt-pdf', this.createRequest(receipt), {
      headers: {
        'X-XSRF-TOKEN': this.state.xsrfToken,
        'Content-Type': 'application/json',
        'Accept': 'application/zip'
      },
      responseType: 'blob',
      withCredentials: true
    })
      .then(response => {

        if (response.status === 200) {
          this.handleContentDisposition(response);
        } else {
          this.toastManager.add(this.state.toast.error.message, this.state.toast.error.options);

        }
      }).catch(error => {

        this.toastManager.add(this.state.toast.error.message, this.state.toast.error.options);

      });
  }

  handleContentDisposition(response) {
    let filename = "racun.zip"
    const link = document.createElement('a')
    link.href = window.URL.createObjectURL(new Blob([response.data]))
    link.download = filename;
    link.click()
  }

  async getReceipts(page, size) {
    await axios.get('http://localhost:9088/api/v1/all?page=' + page + '&size=' + size, {
      headers: {
        'X-XSRF-TOKEN': this.state.xsrfToken,
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
            receipts: response.data.content,
            totalPages: response.data.totalPages,
            size: response.data.size,
            isLoading: false,
          })
        }
      })
      .catch(error => {
        this.setState({ isLoading: false },
          this.toastManager.add("getReceipts " + error.response.status + " " + error.response.statusText, {
            appearance: 'error', autoDismiss: true, autoDismissTimeout: 10000
          }));
      })
  }

  render() {
    const { isLoading, receipts, modal } = this.state;

    if (isLoading) {
      return (
        <div className="loading-position">
          <Spinner className="grow" color="success" />
        </div>
      )
    }

    const statusModal = <Modal isOpen={modal}>
      <ModalHeader>Change status</ModalHeader>
      <ModalBody>
        <Row>
          <Col md={4} >
            <Label className="form-label" ><strong>Status</strong></Label>
          </Col>
          <Col md={7}>
            <Input type="select" name="status" id="status" autoComplete="off" onChange={this.handleChange} value={this.state.statusChange.status}>
              <option value="" > Select </option>
              <option value="IZDAN"> IZDAN</option>
              <option value="STORNIRAN"> STORNIRAN</option>
              <option value="OBRACUNAT"> OBRACUNAT</option>
              <option value="FAKTURIRAN"> FAKTURIRAN</option>
              <option value="PLACEN"> PLACEN</option>
              <option value="ISPLACEN"> ISPLACEN</option>
            </Input>
          </Col>
        </Row>
      </ModalBody>
      <ModalFooter>
        <Button color="danger" onClick={this.closeDialog}>Cancel</Button>
        <Button color="success" onClick={this.statusChangeReceipt}>Save changes</Button>{' '}
      </ModalFooter>
    </Modal>


    const receiptsColumns = [
      {
        name: "Status",
        selector: "calculation.contract.status",
        sortable: true,
        width: "15%"

      },
      {
        name: "Receipt Number",
        selector: "receiptNumber",
        sortable: true,
        width: "15%"
      },
      {
        name: "Date",
        selector: "date",
        sortable: true,
        width: "15%",
        format: row => moment(row.date).format('DD.MM.YYYY.')
      },

      {
        name: "Maturity",
        selector: "maturity",
        sortable: true,
        width: "15%",
        format: row => moment(row.maturity).format('DD.MM.YYYY.')
      },
      {
        name: "Neto",
        selector: "neto",
        sortable: true,
        width: "15%"
      },
      {
        name: "Calculation Number",
        selector: "calculation.number",
        sortable: true,
        width: "10%"
      },
      {
        name: "Action",
        selector: "action",
        width: "15%",
        cell: row => <span>
          <Button size="sm" color="danger" onClick={() => this.handleInvoicesRequest(row)}><FontAwesomeIcon icon={faFilePdf} /> PDF</Button>{' '}
          <Button size="sm" color="warning" onClick={() => this.openDialog(row)}><FontAwesomeIcon icon={faArchive} /> Status</Button>
        </span>
      }
    ]

    let receiptsToShow = this.state.statusFilter === "SVI" ? receipts : receipts.filter(receipt => receipt.calculation.contract.status === this.state.statusFilter);

    return (
      <div>
        <Container fluid>
          <div className="float-right">
            <Button color="success" tag={Link} to="/receipt"><FontAwesomeIcon icon={faReceipt} /> Create Receipt</Button>
          </div>
          <h3 >View Receipts</h3>
          <br></br>
          <Dropdown isOpen={this.state.statusDropdown} toggle={this.toggleStatusDropdown}>
            <DropdownToggle caret style={{ width: '140px',height:'35px', backgroundColor: '#28a84b' }}>
              {this.state.statusFilter}
            </DropdownToggle>
            <DropdownMenu>
              <DropdownItem id={"IZDAN"} name="IZDAN" onClick={(e) => { this.handleStatusFilterChange("IZDAN") }} value={"IZDAN"}>IZDAN</DropdownItem>
              <DropdownItem id={"OBRACUNAT"} name="OBRACUNAT" onClick={(e) => { this.handleStatusFilterChange("OBRACUNAT") }} value={"OBRACUNAT"}>OBRACUNAT</DropdownItem>
              <DropdownItem id={"FAKTURIRAN"} name="FAKTURIRAN" onClick={(e) => { this.handleStatusFilterChange("FAKTURIRAN") }} value={"FAKTURIRAN"}>FAKTURIRAN</DropdownItem>
              <DropdownItem id={"STORNIRAN"} name="STORNIRAN" onClick={(e) => { this.handleStatusFilterChange("STORNIRAN") }} value={"STORNIRAN"}>STORNIRAN</DropdownItem>
              <DropdownItem id={"PLACEN"} name="PLACEN" onClick={(e) => { this.handleStatusFilterChange("PLACEN") }} value={"PLACEN"}>PLACEN</DropdownItem>
              <DropdownItem id={"ISPLACEN"} name="ISPLACEN" onClick={(e) => { this.handleStatusFilterChange("ISPLACEN") }} value={"ISPLACEN"}>ISPLACEN</DropdownItem>
              <DropdownItem id={"SVI"} name="SVI" onClick={(e) => { this.handleStatusFilterChange("SVI") }} value={"SVI"}>SVI</DropdownItem>
            </DropdownMenu>
          </Dropdown>
          {statusModal}

          <DataTable
            noHeader={true}
            columns={receiptsColumns}
            data={receiptsToShow}
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

export default withToastManager(withCookies(withRouter(ViewReceipts)));