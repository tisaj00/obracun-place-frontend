import React, { Component } from 'react';
import { UncontrolledTooltip, Container, Col, Button, Modal, ModalHeader, ModalBody, ModalFooter, Spinner } from 'reactstrap';
import { Link, withRouter } from 'react-router-dom';
import { withCookies } from 'react-cookie';
import { withToastManager } from 'react-toast-notifications';
import axios from 'axios';
import DataTable from 'react-data-table-component';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTimesCircle, faPlus, faFilePdf } from '@fortawesome/free-solid-svg-icons';

import moment from 'moment';
class ViewContracts extends Component {

    emptyContract = {
        id: '',
        date: '',
        startDate: '',
        endDate: '',
        hourlyRate: '',
        student: '',
        partner: '',
        status: '',
        contract_description: ''
    };

    constructor(props) {
        super(props);
        const { cookies, toastManager } = props;
        this.state = {
            initialContract: this.emptyContract,
            xsrfToken: cookies.get('XSRF-TOKEN'),
            isLoading: false,
            contracts: [],
            tooltipOpen: false,
            pageSize: 7,
            modal: false,
            contractToDelete: this.emptyContract,
            contract: this.emptyContract,
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
        this.openDialog = this.openDialog.bind(this);
        this.closeDialog = this.closeDialog.bind(this);
        this.deleteContract = this.deleteContract.bind(this);
    }

    openDialog = (contract) => {
        this.setState({ modal: !this.state.modal, contractToDelete: contract });
    }

    closeDialog() {
        this.setState({ modal: false });
    }

    async componentDidMount() {
        this.setState({ isLoading: true });
        this.getAllContract(0, 10);
    }

    async onChangePage(page, size) {
        await this.getAllContract(page - 1, this.state.size);
    }

    async onChangeRowsPerPage(currentRowsPerPage, currentPage) {
        await this.getAllContract(currentPage - 1, currentRowsPerPage);
    }

    getAllContract = async (page, size) => {
        await axios.get('http://localhost:9088/contract/all?page=' + page + '&size=' + size, {
            headers: {
                'X-XSRF-TOKEN': this.state.xsrfToken,
                'Accept': 'application/json'
            },
            withCredentials: true
        })
            .then(response => {
                if (response.status !== 200) {
                    this.setState({ isLoading: false },
                        () => this.toastManager.add("Undefined error in API: " + response.status, {
                            appearance: 'error', autoDismiss: true, autoDismissTimeout: 3000
                        }));
                } else {
                    this.setState({
                        contracts: response.data.content,
                        totalElements: response.data.totalElements,
                        totalPages: response.data.totalPages,
                        size: response.data.size,
                        isLoading: false,
                    })
                }
            })
            .catch(error => {
                this.setState({ isLoading: false },
                    () => this.toastManager.add("getContract " + error.response.status + " " + error.response.statusText, {
                        appearance: 'error', autoDismiss: true, autoDismissTimeout: 3000
                    }));
            })
    }

    async deleteContract() {
        this.setState({ isLoading: true });
        await axios.delete(`http://localhost:9088/contract/delete/${this.state.contractToDelete.id}`, {
            headers: {
                'X-XSRF-TOKEN': this.state.xsrfToken,
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
                    let updatedContracts = [...this.state.contracts].filter(i => i.id !== this.state.contractToDelete.id);
                    this.setState({ contracts: updatedContracts, isLoading: false, modal: false },
                        () => this.toastManager.add("Contract deleted successfully.", {
                            appearance: 'success', autoDismiss: true, autoDismissTimeout: 3000
                        }));
                }
            })
            .catch(error => {
                this.setState({ isLoading: false },
                    () => this.toastManager.add("ContractDelete " + error.response.status + " " + error.response.statusText, {
                        appearance: 'error', autoDismiss: true, autoDismissTimeout: 3000
                    }));
            })
    }

    createRequest(contract) {
        return {
            contract: {
                id: contract.id,
                date: contract.date,
                contractNumber: contract.contractNumber,
                description: contract.description,
                startDate: contract.startDate,
                endDate: contract.endDate,
                hourlyRate: contract.hourlyRate
            },
            student: {
                name: contract.student.name,
                lastName: contract.student.lastName,
                email: contract.student.email,
                jmbag: contract.student.jmbag,
                dateBirth: contract.student.dateBirth,
                oib: contract.student.oib,
                phone: contract.student.phone
            },
            partner: {
                name: contract.partner.name,
                oib: contract.partner.oib,
                description: contract.partner.description,
                location: contract.partner.location,
                city: contract.partner.city.name
            },
            description: {
                name: contract.description.name
            }

        };
    }

    async handleInvoicesRequest(contract) {

        await axios.post('http://localhost:9088/api/export/contract-pdf', this.createRequest(contract), {
            headers: {
                'X-XSRF-TOKEN': this.state.xsrfToken,
                'Content-Type': 'application/json',
                'Accept': 'application/zip'
            },
            responseType: 'blob',
            withCredentials: true
        })
            .then(response => {
                console.log("SRKY => " + JSON.stringify(response))
                if (response.status === 200) {
                    this.handleContentDisposition(response);
                    console.log(response)
                } else {
                    this.toastManager.add(this.state.toast.error.message, this.state.toast.error.options);
                }
            }).catch(error => {

                this.toastManager.add(this.state.toast.error.message, this.state.toast.error.options);

            });
    }

    handleContentDisposition(response) {
        let filename = "ugovor.zip"
        const link = document.createElement('a')
        link.href = window.URL.createObjectURL(new Blob([response.data]))
        link.download = filename;
        link.click()
    }

    render() {
        const { isLoading, modal, contractToDelete ,contracts} = this.state;

        if (isLoading) {
            return (
                <div className="loading-position">
                    <Spinner className="grow" color="success" />
                </div>
            )
        }

        const deleteModal = <Modal isOpen={modal} centered>
            <ModalHeader>Deleting a Contract</ModalHeader>
            <ModalBody>
                Are you sure you want to delete contract with contract number {contractToDelete.contractNumber} ?
            </ModalBody>
            <ModalFooter>
                <Button color="danger" onClick={this.closeDialog}>Cancel</Button>
                <Button color="success" onClick={this.deleteContract}>Delete Contract</Button>{' '}
            </ModalFooter>
        </Modal>

        const contractsColumns = [
            {
                name: "Contract Number",
                selector: "contractNumber",
                sortable: true,
                width: "9%"
            },
            {
                name: "Date",
                selector: "date",
                sortable: true,
                width: "6%",
                format: row => moment(row.date).format('DD.MM.YYYY.')
            },
            {
                name: "Description",
                selector: "description.name",
                sortable: true,
                width: "15%"
            },
            {
                name: "Start Date",
                selector: "startDate",
                sortable: true,
                width: "8%",
                format: row => moment(row.startDate).format('DD.MM.YYYY.')
            },
            {
                name: "End Date",
                selector: "endDate",
                sortable: true,
                width: "8%",
                format: row => moment(row.endDate).format('DD.MM.YYYY.')
            },
            {
                name: "Hourly Rate",
                selector: "hourlyRate",
                sortable: true,
                width: "6%"
            },
            {
                name: "Student",
                selector: "contract.student",
                sortable: true,
                width: "10%",
                cell: row =>
                    <span style={{ color: "blue", cursor: "pointer" }} id={"target" + row.id}>{row.student.jmbag}
                        <UncontrolledTooltip placement="right" target={"target" + row.id}>
                            {"First Name: " + row.student.name}<br></br>
                            {"Last Name: " + row.student.lastName}<br></br>
                            {"Oib: " + row.student.oib}<br></br>
                            {"Sex: " + row.student.sex}<br></br>
                            {"Phone: " + row.student.phone}<br></br>
                            {"Jmbag: " + row.student.jmbag}<br></br>
                            {"Iban: " + row.student.iban}<br></br>
                            {"Date of Birth: " + moment(row.student.dateBirth).format('DD.MM.YYYY.')}<br></br>
                            {"City: " + row.student.city.name}<br></br>
                        </UncontrolledTooltip>
                    </span>
            },
            {
                name: "Partner",
                selector: "contract.partner",
                sortable: true,
                width: "10%",
                cell: row =>
                    <span style={{ color: "blue", cursor: "pointer" }} id={"target1" + row.id}>{row.partner.name}
                        <UncontrolledTooltip placement="right" target={"target1" + row.id}>
                            {"Oib: " + row.partner.oib}<br></br>
                            {"Location: " + row.partner.location}<br></br>
                            {"Description: " + row.partner.description}<br></br>
                            {"City: " + row.partner.city.name}<br></br>
                        </UncontrolledTooltip>
                    </span>
            },
            {
                name: "Status",
                selector: "status",
                sortable: true,
                width: "8%"
            },
            {
                name: "Action",
                selector: "action",
                width: "20%",
                cell: row => <span>
                    <Button size="sm" color="success" disabled={row.status !== "IZDAN"} tag={Link} to={"/contract/" + row.id}><FontAwesomeIcon icon={faEdit} />{' '}Edit</Button>{' '}
                    <Button size="sm" color="warning" onClick={() => this.openDialog(row)}><FontAwesomeIcon icon={faTimesCircle} />{' '}Delete</Button>{' '}
                    <Button size="sm" color="danger" onClick={() => this.handleInvoicesRequest(row)}><FontAwesomeIcon icon={faFilePdf} />{' '}PDF</Button>{' '}
                </span>
            }
        ]

        return (
            <div>
                <Container fluid>
                    <Col>
                        <div className="float-right">
                            <Button color="success" tag={Link} to="/contract" ><FontAwesomeIcon icon={faPlus} /> Create Contract</Button>
                        </div>
                        <h3>View Contracts</h3>
                        {deleteModal}

                    </Col>
                    <DataTable
                        noHeader={true}
                        columns={contractsColumns}
                        data={contracts}
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

export default withToastManager(withCookies(withRouter(ViewContracts)));