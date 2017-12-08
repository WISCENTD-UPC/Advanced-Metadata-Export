import React from 'react';
import ReactDOM from 'react-dom';
import _ from "lodash";
import "./App.css";
import $ from 'jquery';
import Button from 'material-ui/Button';
import Tooltip from 'material-ui/Tooltip';
import { CircularProgress } from 'material-ui/Progress';

const baseUrl = "http://dhis.academy/dhis"

export default class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loader: "none",
            loader2: "none",
            d2: this.props.d2,
            currentMetadataType: "",
            metadata: [],
            selectedMetadata: [],
            userAndGroupList: [],
            sharingSetting: {
                publicAccess: "r-------",
                userGroupAccesses: [],
                userAccesses: []
            }
        }
    }

    handleSelectorChange = (event) => {
        let metadataType = event.target.value;
        if (metadataType === "") {
            this.setState({
                currentMetadataType: "",
                metadata: []
            });
            return;
        }
        this.setState({
            loader: "block",
            metadata: []
        });
        let metadata = [];
        this.state.d2.models[metadataType].list({ paging: false })
            .then(result => {
                result.toArray().forEach(object => {
                    let already = _.findIndex(this.state.selectedMetadata, element => {
                        return element.id === object.id;
                    });
                    if (already === -1) {
                        metadata.push(object);
                    }
                });
                this.setState({
                    loader: "none",
                    currentMetadataType: metadataType,
                    metadata: metadata
                })
            })
    };

    handleFilterChange = (event) => {
        let currentMetadataType = this.state.currentMetadataType;
        let filterParam = event.target.value;
        if (this.state.currentMetadataType === "") {
            return;
        }

        let options = { paging: false };
        if (filterParam !== "") {
            options.filter = `name:ilike:${filterParam}`;
        }

        this.state.d2.models[currentMetadataType].list(options)
            .then(result => {
                this.setState({
                    metadata: result.toArray()
                })
            })
    };

    handleAddMetadata = (index) => (event) => {
        let metadata = this.state.metadata;
        let selectedMetadata = this.state.selectedMetadata;
        let object = metadata.splice(index, 1)[0];
        object.metadataType = this.state.currentMetadataType;
        selectedMetadata.push(object);
        this.setState({
            selectedMetadata: selectedMetadata
        });
    };

    handleRemoveMetadata = (index) => () => {
        let selectedMetadata = this.state.selectedMetadata;
        selectedMetadata.splice(index, 1);
        this.setState({ selectedMetadata: selectedMetadata });
    };

    handleSearchUserAndGroup = (event) => {
        let filterParam = event.target.value;
        let userAndGroupList = [];
        let options = { paging: false };
        if (filterParam !== "") {
            options.filter = `name:ilike:${filterParam}`;
        }
        let promises = [];
        promises.push(this.state.d2.models.users.list(options)
            .then(result => {
                result.toArray().forEach(user => {
                    user.metadataType = "User";
                    userAndGroupList.push(user);
                });
            })
        );

        promises.push(this.state.d2.models.userGroups.list(options)
            .then(result => {
                result.toArray().forEach(userGroup => {
                    userGroup.metadataType = "User group";
                    userAndGroupList.push(userGroup);
                });
            })
        );

        Promise.all(promises)
            .then(() => {
                this.setState({
                    userAndGroupList: userAndGroupList
                });
            });
    };

    handleAddUserAndGroup = () => {
        let selectedUserAndGroup = $("#selected-user-and-group").val().split(" - ")[2];
        let type = $("#selected-user-and-group").val().split(" - ")[0];
        let name = $("#selected-user-and-group").val().split(" - ")[1];
        if (!selectedUserAndGroup || !type || !name) {
            return;
        }
        let index;
        let sharingSetting = this.state.sharingSetting;
        if (type === "User") {
            index = _.findIndex(sharingSetting.userAccesses, element => {
                return element.id === selectedUserAndGroup;
            });
            if (index !== -1) {
                return;
            }
            sharingSetting.userAccesses.push({
                metadataType: "User",
                id: selectedUserAndGroup,
                displayName: name,
                access: "r-------"
            })
        }
        else {
            index = _.findIndex(sharingSetting.userGroupAccesses, element => {
                return element.id === selectedUserAndGroup;
            });
            if (index !== -1) {
                return;
            }
            sharingSetting.userGroupAccesses.push({
                metadataType: "User group",
                id: selectedUserAndGroup,
                displayName: name,
                access: "r-------"
            })
        }
        this.setState({
            sharingSetting: sharingSetting
        });
    };

    handleChangeAccess = (id, type) => (event) => {
        let access = event.target.value;
        let index;
        let sharingSetting = this.state.sharingSetting;
        if (type === "User") {
            index = _.findIndex(sharingSetting.userAccesses, element => {
                return element.id === id;
            });
            sharingSetting.userAccesses[index].access = access;
        } else {
            index = _.findIndex(sharingSetting.userGroupAccesses, element => {
                return element.id === id;
            });
            sharingSetting.userGroupAccesses[index].access = access;
        }
    };

    handleRemoveUserAndGroup = (id, type) => () => {
        let sharingSetting = this.state.sharingSetting;
        let index;
        if (type === "User") {
            index = _.findIndex(sharingSetting.userAccesses, element => {
                return element.id === id;
            });
            sharingSetting.userAccesses.splice(index, 1);
        } else {
            index = _.findIndex(sharingSetting.userGroupAccesses, element => {
                return element.id === id;
            });
            sharingSetting.userGroupAccesses.splice(index, 1);
        }
        this.setState({ sharingSetting: sharingSetting });
    };

    handleSubmit = () => {
        this.setState({
            loader2: "block"
        })
        let promises = [];
        let success = 0;
        let fail = 0;
        let errorMessage = "ERRORS: \r";
        if (this.state.selectedMetadata.length === 0) {
            alert("Nothing to submit!");
            return;
        }
        this.state.selectedMetadata.forEach(element => {
            let userGroupAccesses = this.state.sharingSetting.userGroupAccesses;
            let userAccesses = this.state.sharingSetting.userAccesses;
            let publicAccess = this.state.sharingSetting.publicAccess;
            let payload = {
                object: {
                    publicAccess: publicAccess,
                    externalAccess: false,
                    userGroupAccesses: userGroupAccesses,
                    userAccesses: userAccesses
                }
            };
            promises.push(fetch(`${baseUrl}/api/sharing?type=${element.metadataType}&id=${element.id}`, {
                method: "POST",
                headers: {
                    Authorization: "Basic " + btoa("admin:district"),
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            })
                .then(result => result.json())
                .then(json => {
                    if (json.status === "ERROR") {
                        fail += 1;
                        errorMessage += "(" + element.metadataType + ") " + element.name + " - " + json.message + "\r\n";
                    }
                    else {
                        success += 1;
                    }
                })
            );
        });

        Promise.all(promises)
            .then(() => {
                this.setState({
                    loader2: "none"
                })
                let message = `Submit completed, success: ${success}, fail: ${fail} \r`;
                message += errorMessage;
                alert(message);
            });
    };

    handleChangePublicAccess = (event) => {
        let value = event.target.value;
        let sharingSetting = this.state.sharingSetting;
        sharingSetting.publicAccess = value;
        this.setState({ sharingSetting });
    };

    render() {
        return (
            <div>
                <div id="metadata-type-selector">
                    <div>Please select metadata type:</div>
                    <div>
                        <select onChange={this.handleSelectorChange}>
                            <option value="">Select metadata type</option>{
                                _.sortBy(_.uniq(Object.keys(this.state.d2.models).filter(model => {
                                    return (this.state.d2.models[model].isShareable && this.state.d2.models[model].isMetaData);
                                }).map(model => {
                                    return this.state.d2.models[model].name
                                })))
                                    .map((model, index) => {
                                        return <option key={index} value={this.state.d2.models[model].name}>{this.state.d2.models[model].displayName}</option>
                                    })
                            }
                        </select>
                    </div>
                </div>
                <div id="metadata-name-filter-container">
                    <div>Search:</div>
                    <div><input type="text" d="metadata-name-filter" onChange={this.handleFilterChange} /></div>
                </div>
                <div id="metadata-table-container">
                    <div id="metadata-table">

                        <div className="metadata-table-header-container">
                            <div className="metadata-table-id-col">Uid</div>
                            <div className="metadata-table-name-col">Name</div>
                        </div>
                        <CircularProgress size={50} style={{ display: this.state.loader }} />
                        {
                            this.state.metadata.map((element, index) => {
                                return (
                                    <div className="metadata-table-row-container" onClick={this.handleAddMetadata(index)}>
                                        <div className="metadata-table-id-col">{element.id}</div>
                                        <div className="metadata-table-name-col">{element.name}</div>
                                    </div>

                                )
                            })
                        }

                    </div>
                    <div id="selected-metadata-container">
                        <div id="selected-metadata-table">
                            <div className="selected-metadata-table-header-container">
                                <div className="selected-metadata-table-id-col">Uid</div>
                                <div className="selected-metadata-table-name-col">Name</div>
                                <div className="selected-metadata-table-type-col">Type</div>
                            </div>
                            {
                                this.state.selectedMetadata.map((element, index) => {
                                    return (
                                        <div className="selected-metadata-table-row-container" onClick={this.handleRemoveMetadata(index)}>
                                            <div className="selected-metadata-table-id-col">{element.id}</div>
                                            <div className="selected-metadata-table-name-col">{element.name}</div>
                                            <div className="selected-metadata-table-type-col">{element.metadataType}</div>
                                        </div>
                                    )
                                })
                            }
                        </div>
                        <div id="sharing-setting-form">
                            <div id="sharing-setting-item-container">
                                <div>
                                    <strong>Search users or user groups:</strong>
                                    <input id="selected-user-and-group" list="user-and-group-list" onChange={this.handleSearchUserAndGroup} style={{ width: 500 }} />
                                    <datalist id="user-and-group-list" style={{ overflowY: "scroll" }}>
                                        {
                                            this.state.userAndGroupList.map(element => {
                                                return <option value={element.metadataType + " - " + element.name + " - " + element.id}></option>
                                            })
                                        }
                                    </datalist>
                                    <button onClick={this.handleAddUserAndGroup}> + </button>
                                </div>
                                <div className="sharing-setting-item">
                                    <div>Public access:</div>
                                    <div>
                                        <select onChange={this.handleChangePublicAccess}>
                                            <option value="r-------">Can view</option>
                                            <option value="rw------">Can view and edit</option>
                                            <option value="--------">No access</option>
                                        </select>
                                    </div>
                                </div>
                                {
                                    this.state.sharingSetting.userAccesses.map(ua => {
                                        return (
                                            <div className="sharing-setting-item">
                                                <div>({ua.metadataType}) {ua.displayName}:</div>
                                                <div>
                                                    <select onChange={this.handleChangeAccess(ua.id, ua.metadataType)}>
                                                        <option value="r-------">Can view</option>
                                                        <option value="rw------">Can view and edit</option>
                                                        <option value="--------">No access</option>
                                                    </select>
                                                </div>
                                                <div><button onClick={this.handleRemoveUserAndGroup(ua.id, ua.metadataType)}><strong> - </strong></button></div>
                                            </div>
                                        )
                                    })
                                }
                                {
                                    this.state.sharingSetting.userGroupAccesses.map(uga => {
                                        return (
                                            <div className="sharing-setting-item">
                                                <div>({uga.metadataType}) {uga.displayName}:</div>
                                                <div>
                                                    <select onChange={this.handleChangeAccess(uga.id, uga.metadataType)}>
                                                        <option value="r-------">Can view</option>
                                                        <option value="rw------">Can view and edit</option>
                                                        <option value="--------">No access</option>
                                                    </select>
                                                </div>
                                                <div><button onClick={this.handleRemoveUserAndGroup(uga.id, uga.metadataType)}><strong> - </strong></button></div>
                                            </div>
                                        )
                                    })
                                }
                            </div>
                            <div style={{ display: "flex" }}>
                                <div>
                                    <Button raised color="primary" onClick={this.handleSubmit}>
                                        SUBMIT
                                </Button>
                                </div>
                                <div>
                                    <CircularProgress style={{ display: this.state.loader2 }} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

}