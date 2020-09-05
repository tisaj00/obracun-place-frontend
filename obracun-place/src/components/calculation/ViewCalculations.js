import React, { Component } from 'react';
import { Container, UncontrolledTooltip, Col, Modal, ModalHeader, ModalFooter, ModalBody, Button, Spinner, Table } from 'reactstrap';
import { Link, withRouter } from 'react-router-dom';
import { withCookies } from 'react-cookie';
import { withToastManager } from 'react-toast-notifications';
import moment from 'moment';
import { faEdit, faInfo } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import axios from 'axios';
import DataTable from 'react-data-table-component';

class ViewCalculations extends Component {

    emptyCalculation = {
        id: false,
        number: '',
        date: '',
        hours: '',
        bonusHours: '',
        bonusHours1: null,
        total: null,
        total1: null,
        total2: null,
        contract: {
            contractNumber: '',
            hourlyRate: null,
            description: {
                name: ''
            }
        }
    };

    constructor(props) {
        super(props);
        const { cookies, toastManager } = props;
        this.state = {
            isLoading: false,
            calculations: [],
            selectedPage: 1,
            totalElements: null,
            totalPages: null,
            pageSize: 7,
            tooltipOpen: false,
            modal: false,
            calculation: this.emptyCalculation
        };
        this.toastManager = toastManager;
        this.closeDialog = this.closeDialog.bind(this);
        this.openDialog = this.openDialog.bind(this);
        this.toggle = this.toggle.bind(this);
    }

    async componentDidMount() {
        this.setState({ isLoading: true });
        this.getAllCalculation(0, 10);
    }

    async onChangePage(page, totalRows) {
        await this.getAllCalculation(page - 1, this.state.size);
    }

    async onChangeRowsPerPage(currentRowsPerPage, currentPage) {
        console.log("onChangeRowsPerPage ")
        await this.getAllCalculation(currentPage - 1, currentRowsPerPage);
    }

    toggle() {
        this.setState({
            tooltipOpen: !this.state.tooltipOpen
        }, () => { console.log(this.state.tooltipOpen) });
    }

    closeDialog() {
        this.setState({ modal: false, calculation: this.emptyCalculation });
    }

    openDialog = (calculation) => {
        this.setState({ modal: !this.state.modal, calculation: calculation });
    }

    async getAllCalculation(page, size) {
        await axios.get('/calculation/all?page=' + page + '&size=' + size, {
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
                    let calculations = []
                    calculations = response.data.content.map(element => {
                        return {
                            id: element.id,
                            number: element.number,
                            date: element.date,
                            hours: element.hours,
                            bonusHours: element.bonusHours,
                            contract: {
                                contractNumber: element.contract.contractNumber,
                                hourlyRate: element.contract.hourlyRate,
                                status: element.contract.status,
                                startDate: element.contract.startDate,
                                endDate: element.contract.endDate,
                                description: element.contract.description.name,
                                student: element.contract.student.jmbag,
                                partner: element.contract.partner.name,
                                created: element.contract.created
                            },
                            bonusHours1: element.contract.hourlyRate * 1.5,
                            total: element.hours * element.contract.hourlyRate,
                            total1: element.bonusHours * element.contract.hourlyRate * 1.5,
                            total2: (element.hours * element.contract.hourlyRate) + (element.bonusHours * element.contract.hourlyRate * 1.5)
                        }
                    });
                    this.setState({
                        calculations: calculations,
                        totalElements: response.data.totalElements,
                        totalPages: response.data.totalPages,
                        size: response.data.size,
                        isLoading: false
                    })
                }
            })
            .catch(error => {
                this.setState({ isLoading: false },
                    this.toastManager.add("getCalculation " + error.response.status + " " + error.response.statusText, {
                        appearance: 'error', autoDismiss: true, autoDismissTimeout: 10000
                    }));
            })
    }

    render() {
        const { isLoading, calculations, modal, calculation } = this.state;

        if (isLoading) {
            return (
                <div className="loading-position">
                    <Spinner className="grow" color="success" />
                </div>
            )
        }

        const detailsModal = <Modal isOpen={modal} centered size="lg">
            <ModalHeader style={{ backgroundColor: '#28a84b', fontWeight: 'bold', color: 'white' }}>Details Calculation</ModalHeader>
            <ModalBody>
                <Table bordered response >
                    <thead>
                        <tr>
                            <th>Vrsta Rada</th>
                            <th>Broj sati</th>
                            <th>Cijena</th>
                            <th>Ukupno(HRK)</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <th scope="row">Redoviti Rad</th>
                            <th>{calculation.hours}</th>
                            <th> {calculation.contract.hourlyRate}</th>
                            <th> {calculation.total == null ? null : calculation.total.toFixed(2)} </th>
                        </tr>
                        <tr>
                            <th scope="row">Rad noću,blagdanima,nedeljom(+50%)</th>
                            <th>{calculation.bonusHours} </th>
                            <th>{calculation.bonusHours1 === null ? null : calculation.bonusHours1.toFixed(2)}</th>
                            <th>{calculation.total1 === null ? null : calculation.total1.toFixed(2)} </th>
                        </tr>
                        <tr>
                            <th scope="row">Ukupno</th>
                            <th> </th>
                            <th> </th>
                            <th>{calculation.total2 == null ? null : calculation.total2.toFixed(2)}</th>
                        </tr>
                    </tbody>
                </Table>
            </ModalBody>
            <ModalFooter>
                <Button color="success" onClick={this.closeDialog}>Cancel</Button>{' '}
            </ModalFooter>
        </Modal>


        const calculationsColumns = [
            {
                name: "Calculation Number",
                selector: "number",
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
                name: "Hours",
                selector: "hours",
                sortable: true,
                width: "10%"
            },
            {
                name: "Bonus Hours",
                selector: "bonusHours",
                sortable: true,
                width: "10%"
            },
            {
                name: "Contract Number",
                selector: "contract.contractNumber",
                sortable: true,
                width: "15%",
                cell: row =>
                    <span style={{ color: "blue", cursor: "pointer" }} id={"target" + row.contract.contractNumber}>{row.contract.contractNumber}
                        <UncontrolledTooltip placement="right" target={"target" + row.contract.contractNumber}>
                            {"Created: " + moment(row.contract.created).format('DD.MM.YYYY.')}<br></br>
                            {"Start date: " + moment(row.contract.startDate).format('DD.MM.YYYY.')}<br></br>
                            {"End date: " + moment(row.contract.endDate).format('DD.MM.YYYY.')}<br></br>
                            {"Description: " + row.contract.description}<br></br>
                            {"Hourly Rate: " + row.contract.hourlyRate}<br></br>
                            {"Student: " + row.contract.student}<br></br>
                            {"Partner: " + row.contract.partner}<br></br>
                        </UncontrolledTooltip>
                    </span>
            },
            {
                name: "Status",
                selector: "contract.status",
                sortable: true,
                width: "15%"
            },
            {
                name: "Action",
                selector: "action",
                width: "15%",
                cell: row => <span>
                    <Button size="sm" color="success" tag={Link} disabled={row.contract.status !== "OBRACUNAT"} to={{ pathname: "/calculation/" + row.id }}><FontAwesomeIcon icon={faEdit} />{' '}Edit</Button>{' '}
                    <Button size="sm" color="warning" tag={Link} to={"/calculationReview/" + row.id} onClick={(e) => this.openDialog(row)}><FontAwesomeIcon icon={faInfo} />{' '}Details</Button>{' '}
                </span>
            }
        ]

        return (
            <div>
                <Container fluid>
                    <Col>
                        <div className="float-right">
                            <Button color="success" tag={Link} to="/calculation" >Create Calculation</Button>
                        </div>
                        <h3>View Calculations</h3>
                        {detailsModal}
                    </Col>
                    <DataTable
                        noHeader={true}
                        columns={calculationsColumns}
                        data={calculations}
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

export default withToastManager(withCookies(withRouter(ViewCalculations)));