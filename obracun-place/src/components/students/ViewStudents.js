import React, { Component } from 'react';
import { Container, Row, Col,  Label, Input, Button, Modal, ModalHeader, ModalBody, ModalFooter, Spinner } from 'reactstrap';
import { Link, withRouter } from 'react-router-dom';
import { faEdit, faTimesCircle, faIdCard, faPlus,  } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { instanceOf } from 'prop-types';
import { withCookies, Cookies } from 'react-cookie';
import { withToastManager } from 'react-toast-notifications';
import axios from 'axios';
import DataTable from 'react-data-table-component';
import moment from 'moment';
import avatarImage from './logo.png';


class ViewStudents extends Component {
    static propTypes = {
        cookies: instanceOf(Cookies).isRequired
    };

    emptyStudent = {
        id: null,
        name: '',
        lastName: '',
        dateBirth: null,
        jmbag: '',
        email: ''
    }

    emptyStudentView = {
        oib: '',
        name: '',
        lastName: '',
        phone: '',
        email: '',
        dateBirth: null,
        sex: '',
        imageUrl:'',
        jmbag: '',
        faculty: {
            name: ''
        },
        iban: '',
        city: {
            name: ''
        }
    };

    constructor(props) {
        super(props);
        const { cookies, toastManager } = props;
        this.state = {
            students: [],
            isLoading: false,
            totalElements: null,
            studentToDelete: this.emptyStudent,
            modal: false,
            modalStudent: false,
            studentsView: this.emptyStudentView,
            studentView: null,
        };
        this.toastManager = toastManager;
        this.openDialog = this.openDialog.bind(this);
        this.closeDialog = this.closeDialog.bind(this);
        this.closeStudentDialog = this.closeStudentDialog.bind(this);
        this.deleteStudent = this.deleteStudent.bind(this);
        this.openDialogStudent = this.openDialogStudent.bind(this);
    }

    openDialog = (student) => {
        this.setState({ modal: !this.state.modal, studentToDelete: student });
    }

    openDialogStudent = () => {
        this.setState({ modalStudent: !this.state.modalStudent});
    }

    async onChangePage(page, size) {
        await this.getAllStudents(page - 1, this.state.size);
    }

    async onChangeRowsPerPage(currentRowsPerPage, currentPage) {
        await this.getAllStudents(currentPage - 1, currentRowsPerPage);
    }

    closeDialog() {
        this.setState({ modal: false });
    }

    closeStudentDialog() {
        this.setState({ modalStudent: false });
    }

    async componentDidMount() {
        this.setState({ isLoading: true });
        this.getAllStudents(0, 10);
    }

    async deleteStudent() {
        this.setState({ isLoading: true });
        await axios.delete(`/api/delete-student/${this.state.studentToDelete.id}`, {
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
                    let updatedStudents = [...this.state.students].filter(i => i.id !== this.state.studentToDelete.id);
                    this.setState({ students: updatedStudents, isLoading: false, modal: false },
                        () => this.toastManager.add("Student deleted successfully.", {
                            appearance: 'success', autoDismiss: true, autoDismissTimeout: 3000
                        }));
                }
            })
            .catch(error => {
                this.setState({ isLoading: false },
                    () => this.toastManager.add("StudenDelete " + error.response.status + " " + error.response.statusText, {
                        appearance: 'error', autoDismiss: true, autoDismissTimeout: 3000
                    }));
            })
    }
    async getAllStudents(page, size) {
        await axios.get('/api/all-students?&page=' + page + '&size=' + size, {
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
                        students: response.data.content,
                        totalElements: response.data.totalElements,
                        totalPages: response.data.totalPages,
                        size: response.data.size,
                        isLoading: false,
                    })
                }
            })
            .catch(error => {
                this.setState({ isLoading: false },
                    this.toastManager.add("getStudents " + error.response.status + " " + error.response.statusText, {
                        appearance: 'error', autoDismiss: true, autoDismissTimeout: 10000
                    }));
            })
    }

    async getStudentById(id) {
        await axios.get(`/api/${id}`, {
            headers: {
                'Accept': 'application/json'
            },
            withCredentials: true
        })
            .then(response => {
                console.log(response.data)
                if (response.status !== 200) {
                    this.toastManager.add("Undefined error in API: " + response.status, {
                        appearance: 'error', autoDismiss: true, autoDismissTimeout: 3000
                    });
                } else {
                    this.setState({ studentView: response.data.student });
                    this.openDialogStudent(this.state.studentView);
                }
            })
            .catch(error => {
                this.toastManager.add("getStudent " + error.response.status + " " + error.response.statusText, {
                    appearance: 'error', autoDismiss: true, autoDismissTimeout: 3000
                });
            })
    }

    render() {
        const { students, isLoading, studentToDelete, modal, modalStudent, studentView} = this.state;

        if (isLoading) {
            return (
                <div className="loading-position">
                    <Spinner className="grow" color="success" />
                </div>
            )
        }

        /* const isAdmin =(roles.includes('ROLE_ADMIN')) */

        const ViewStudent = <Modal isOpen={modalStudent} centered size="lg" >
            <ModalHeader style={{ backgroundColor: '#28a84b', fontWeight: 'bold', color: 'white' }}>View Student</ModalHeader>
            <ModalBody>
                <Row>
                    <Col md={4} >
                        <Label className="form-label" for="photo" ><strong>Photo</strong></Label>
                        <div><img src={studentView && studentView.imageUrl== null ? avatarImage : studentView && studentView.imageUrl } style={{ width: '220px', height: '220px' }} /></div>
                    </Col>
                    <Col md={8}>
                        <Row>
                            <Col md={6}>
                                <Label className="form-label" for="name"> <strong>First Name</strong></Label>
                                <Input type="text" disabled={true} name="name" id="name" onChange={this.handleChange} value={studentView && studentView.name} />
                            </Col>
                            <Col md={6}>
                                <Label className="form-label" for="lastName"><strong>Last Name</strong></Label>
                                <Input type="text" disabled={true} name="lastName" id="lastName" onChange={this.handleChange} value={studentView && studentView.lastName} />
                            </Col>
                            <Col md={4}>
                                <Label style={{ marginTop: '15px' }} className="form-label" for="dateBirth"> <strong>Date of Birth</strong></Label>
                                <Input type="text" disabled={true} name="dateBirth" id="dateBirth" onChange={this.handleChange} value={studentView && moment(studentView.dateBirth).format('DD.MM.YYYY.')} />
                            </Col>
                            <Col md={4}>
                                <Label style={{ marginTop: '15px' }} className="form-label" for="jmbag"> <strong>JMBAG</strong></Label>
                                <Input type="text" disabled={true} id="jmbag" autoComplete="off" onChange={this.handleChange} value={studentView && studentView.jmbag} />
                            </Col>
                            <Col md={4}>
                                <Label style={{ marginTop: '15px' }} className="form-label" for="sex"> <strong>Sex</strong></Label>
                                <Input type="text" disabled={true} name="sex" id="sex" onChange={this.handleChange} value={studentView && studentView.sex} />
                            </Col>
                            <Col md={6}>
                                <Label style={{ marginTop: '15px' }} className="form-label" for="phone"><strong>Phone Number</strong></Label>
                                <Input type="text" disabled={true} name="phone" id="phone" autoComplete="off" onChange={this.handleChange} value={studentView && studentView.phone} />
                            </Col>
                            <Col md={6}>
                                <Label style={{ marginTop: '15px' }} className="form-label" for="oib"><strong>OIB</strong></Label>
                                <Input type="text" disabled={true} name="oib" id="oib" onChange={this.handleChange} value={studentView && studentView.oib} />
                            </Col>
                        </Row>
                    </Col>
                </Row>
                <Row>
                    <Col md={4}>
                        <Label style={{ marginTop: '10px' }} className="form-label" for="iban"> <strong>IBAN</strong></Label>
                        <Input type="text" disabled={true} name="iban" id="iban" autoComplete="off" onChange={this.handleChange} value={studentView && studentView.iban} />
                    </Col>

                    <Col md={4}>
                        <Label style={{ marginTop: '10px' }} className="form-label" for="email"><strong>Email</strong></Label>
                        <Input type="text" disabled={true} name="email" id="email" autoComplete="off" onChange={this.handleChange} value={studentView && studentView.email} />
                    </Col>
                    <Col md={4}>
                        <Label style={{ marginTop: '10px' }} className="form-label" for="city"><strong>City</strong></Label>
                        <Input type="text" disabled={true} name="city" id="city" autoComplete="off" onChange={this.handleChange} value={studentView && studentView.city.name} />
                    </Col>
                </Row>
                <Row>
                    <Col md={12}>
                        <Label style={{ marginTop: '10px' }} className="form-label" for="faculty"> <strong>Faculty</strong></Label>
                        <Input type="text" disabled={true} id="faculty" autoComplete="off" onChange={this.handleChange} value={studentView && studentView.faculty.name} />
                    </Col>
                </Row>
                <br></br>
                <Button style={{ float: 'right' }} color="success" onClick={this.closeStudentDialog} tag={Link} to={"/students"}>Cancel</Button>
            </ModalBody>
        </Modal >

        const deleteModal = <Modal isOpen={modal} centered>
            <ModalHeader>Deleting a Student</ModalHeader>
            <ModalBody>
                Are you sure you want to delete student {studentToDelete.name + " " + studentToDelete.lastName} with jmbag : {studentToDelete.jmbag} ?
            </ModalBody>
            <ModalFooter>
                <Button color="danger" onClick={this.closeDialog}>Cancel</Button>
                <Button color="success" onClick={this.deleteStudent}>Delete Student</Button>{' '}
            </ModalFooter>
        </Modal>

        const studentsColumns = [
            {
                name: "First Name",
                selector: "name",
                sortable: true,
                width: "15%"
            },
            {
                name: "Last Name",
                selector: "lastName",
                sortable: true,
                width: "15%"
            },
            {
                name: "Date of Birth",
                selector: "dateBirth",
                sortable: true,
                width: "15%",
                format: row => moment(row.dateBirth).format('DD.MM.YYYY.')
            },
            {
                name: "JMBAG",
                selector: "jmbag",
                sortable: true,
                width: "15%"
            },
            {
                name: "Email",
                selector: "email",
                sortable: true,
                width: "20%"
            },
            {
                name: "Action",
                selector: "action",
                width: "20%",
                cell: row => <span>
                    <Button size="sm" color="success" tag={Link} to={"/student/" + row.id}><FontAwesomeIcon icon={faEdit} />{' '}Edit</Button>{' '}
                    <Button size="sm" color="danger" onClick={() => this.openDialog(row)}><FontAwesomeIcon icon={faTimesCircle} />{' '}Delete</Button>{' '}
                    <Button size="sm" color="warning" onClick={() => this.getStudentById(row.id)}><FontAwesomeIcon icon={faIdCard} />{' '}View</Button>
                </span>
            }
        ]

        return (
            <div>
                <Container fluid>
                    <div className="float-right">
                        <Button color="success" tag={Link} to="/student"><FontAwesomeIcon icon={faPlus} /> Create Student</Button>
                    </div>
                    <h3 className="view-domains-titles"> View Students</h3>
                    {deleteModal}
                    {ViewStudent}
                    <DataTable
                        noHeader={true}
                        columns={studentsColumns}
                        data={students}
                        highlightOnHover
                        pagination
                        paginationServer
                        paginationRowsPerPageOptions={[5, 10, 15, 20]}
                        paginationTotalRows={this.state.totalElements}
                        onChangePage={(page, totalRows) => this.onChangePage(page, totalRows)}
                        onChangeRowsPerPage={(currentRowsPerPage, currentPage) => this.onChangeRowsPerPage(currentRowsPerPage, currentPage)}
                    />
                    
                </Container >
            </div>
        );
    }
}

export default withToastManager(withCookies(withRouter(ViewStudents)));