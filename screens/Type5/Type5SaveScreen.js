import { CommonActions, useNavigation, useRoute } from "@react-navigation/native";
import axios from "axios";
import { useEffect, useState } from "react";
import { Alert, Clipboard, FlatList, Image, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

const API_BASE_URL = 'https://ims-api.nepra.co.in/api/company/v1/';
const API_ENDPOINTS = {
    TABLE_OCR: 'directory_table_extraction',
    SAVE_JSON: 'save-gspma-data',
    SYNC_DATA: 'get-gspma-data',
    GET_EXCEL: 'export-excel',
};

const Type5SaveScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { data, extractedData = [] } = route.params || {};
    const [listBlocks, setListBlocks] = useState([]); // To hold and update the list
    const [recognizedText, setRecognizedText] = useState(''); // Recognized text
    const [isEditModalVisible, setEditModalVisible] = useState(false);   // //Edit Dialog
    const [isCopyModalVisible, setCopyModalVisible] = useState(false);  //Copy Dialog
    const [loading, setLoading] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [editedData, setEditedData] = useState({
        name: "",
        factory: "",
        office: "",
        contact: "",
        mobile: "",
        email: "",
        product: "",
    });

    //type5 process data
    const extractedtext = route?.params.recognizedText || ''
    //filepath url
    const filePath = route?.params.croppedImageUri
    useEffect(() => {
        if (extractedData.length > 0) {
            setListBlocks(extractedData);
        } else {
            Alert.alert("No Data", "No valid data to display")
        }
    }, [data, extractedData]);

    const retryProcess = () => {
        navigation.dispatch(CommonActions.reset({
            routes: [{ name: 'Type5ProcessScreen' }]
        }))
    };
    const saveEditDialogDetails = () => {
        if (selectedItem) {
            const updatedBlocks = [...listBlocks];
            updatedBlocks[selectedItem.index] = { ...editedData };
            setListBlocks(updatedBlocks); // Update the list
            setEditModalVisible(false); // Close modal
            setSelectedItem(null);
            setEditedData({
                name: "",
                factory: "",
                office: "",
                contact: "",
                mobile: "",
                email: "",
                product: "",
            });
        }
    };

    //Open EditDialog
    const openEditDialog = (item, index) => {
        setSelectedItem({ ...item, index });
        setEditedData(item);
        setEditModalVisible(true);
    };

    //Open CopyDialog
    const openCopyDialog = () => {
        setRecognizedText(extractedtext);
        setCopyModalVisible(true);
    };

    const saveJson = async (unorganizedJson, jsonData, appFilePath, filePath, type) => {

        try {

            const requestData = {};

            const addImageToRequest = (request, title, url) => {
                if (url && !url.startsWith("http")) {
                    request[title] = url;
                }
            };

            requestData["json_data"] = jsonData;
            requestData["type"] = type;

            if (unorganizedJson) {
                requestData["unorganize_json"] = unorganizedJson;
            }

            if (appFilePath) {
                addImageToRequest(requestData, "img", appFilePath);
            }
            if (filePath) {
                addImageToRequest(requestData, "excel_file", filePath);
            }

            console.log("Type5DATAAAAA", requestData)
            const response = await axios.post(`${API_BASE_URL}${API_ENDPOINTS.SAVE_JSON}`, requestData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            if (response.status === 200) {
                Alert.alert("Success", response.data.msg);
                navigation.dispatch(CommonActions.reset({
                    index: 0,
                    routes: [{ name: 'Dashboard' }]
                }))


                return response.data.msg;
            } else {
                Alert.alert("Error", response.data.msg);
                throw new Error(response.data.msg);
            }
        }
        catch (error) {
            Alert.alert("Save Data Error:", error.message)
        }
    }

    const getJsonDataPlastivision = () => {
        const jsonArray = listBlocks.map((item) => {
            return {
                name: item.name,
                factory: item.factory,
                office: item.office,
                contact: item.contact,
                mobile: item.mobile,
                email: item.email,
                product: item.product,
            };
        })
        return JSON.stringify(jsonArray)
    }

    //save data of edit dialog details
    const testSaveJson = async () => {
        try {
            saveJson("", getJsonDataPlastivision(), filePath, filePath, "5")
        }
        catch (error) {
            Alert.alert("Error", error.message)
        }
    }

    //Delete the flatlist item
    const deleteItem = (indexToDelete) => {
        setListBlocks((prevlist) => prevlist.filter((_, index) => index !== indexToDelete));
    }

    // New code for delete the flatlist item
    const renderItem = ({ item, index }) => (
        <TouchableOpacity style={styles.listItem} onPress={() => openEditDialog(item, index)}>
            <View style={styles.itemContent}>
                <View>
                    <Text>Name: {item.name || ''}</Text>
                    <Text>Factory: {item.factory || ''}</Text>
                    <Text>Office: {item.office || ''}</Text>
                    <Text>Contact: {item.contact || ''}</Text>
                    <Text>Mobile: {item.mobile || ''}</Text>
                    <Text>Email: {item.email || ''}</Text>
                    <Text>Product: {item.product || ''}</Text>
                </View>
                <TouchableOpacity onPress={() => deleteItem(index)} style={styles.deleteIconWrapper}>
                    <Image
                        source={require('../assets/delete_icon.png')} // Replace with your image path
                        style={styles.deleteIcon}
                    />
                    {/* <Text style={{fontSize:18,color:'black'}}>Delete Item</Text> */}
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );
    return (
        <View style={styles.container}>
            {loading && <Text style={styles.loadingText}>Loading...</Text>}
            <FlatList
                // data={extractedData}   // working for getting the type5processscreen extracted data to the new type 5 save screen 
                data={listBlocks}
                keyExtractor={(item, index) => index.toString()}
                renderItem={renderItem}
            />
            <TouchableOpacity style={styles.button} onPress={testSaveJson} disabled={loading}>
                <Text style={styles.buttonText}>Save Data</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={retryProcess}>
                <Text style={styles.buttonText}>Retry</Text>
            </TouchableOpacity>

            {/* Copy Modal */}
            <Modal visible={isCopyModalVisible} transparent={false} animationType="slide">
                <View style={[styles.modalContainer,{flex:1}]}>
                    <TextInput
                        style={[styles.input, { flex: 1 }]}
                        multiline={true}
                        value={recognizedText || ''}
                    />
                    {/* Add other fields here */}
                    <View style={styles.modalActions}>
                        <TouchableOpacity
                            style={styles.button}
                            onPress={() => setCopyModalVisible(false)}
                        >
                            <Text style={styles.buttonText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Edit Modal */}
            <Modal visible={isEditModalVisible} transparent={true} animationType="slide">
                <View style={{ flex: 1 }}>
                    <ScrollView contentContainerStyle={[styles.modalContainer]}>
                        <View>
                            <View style={{ flexDirection: 'column', flex: 1 }}>
                                <Text style={styles.modalTitle}>Edit Data</Text>
                                <TouchableOpacity onPress={() => openCopyDialog()}>
                                    <Text style={styles.copyTitle}>Copy Data</Text>
                                </TouchableOpacity>

                            </View>

                            <TextInput
                                multiline={true}
                                style={styles.input}
                                placeholder="Name"
                                value={editedData?.name || ''}
                                onChangeText={(text) => setEditedData({ ...editedData, name: text })}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="Factory"
                                multiline={true}
                                value={editedData?.factory || ''}
                                onChangeText={(text) => setEditedData({ ...editedData, factory: text })}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="Office"
                                multiline={true}
                                value={editedData?.office || ''}
                                onChangeText={(text) => setEditedData({ ...editedData, office: text })}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="Contact"
                                multiline={true}
                                value={editedData?.contact || ''}
                                onChangeText={(text) => setEditedData({ ...editedData, contact: text })}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="Mobile"
                                multiline={true}
                                value={editedData?.mobile || ''}
                                onChangeText={(text) => setEditedData({ ...editedData, mobile: text })}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="Email"
                                multiline={true}
                                value={editedData?.email || ''}
                                onChangeText={(text) => setEditedData({ ...editedData, email: text })}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="Product"
                                multiline={true}
                                value={editedData?.product || ''}
                                onChangeText={(text) => setEditedData({ ...editedData, product: text })}
                            />
                            {/* Add other fields here */}
                            <View style={styles.modalActions}>
                                <TouchableOpacity style={styles.button} onPress={saveEditDialogDetails}>
                                    <Text style={styles.buttonText}>Save</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.button}
                                    onPress={() => setEditModalVisible(false)}
                                >
                                    <Text style={styles.buttonText}>Cancel</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </ScrollView>
                </View>
            </Modal>
        </View>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16 },
    itemContainer: { padding: 16, backgroundColor: '#f0f0f0', marginBottom: 8 },
    itemText: { fontSize: 14, color: '#333' },
    button: { padding: 12, backgroundColor: '#00C569', marginVertical: 8, borderRadius: 4 },
    buttonText: { color: '#fff', textAlign: 'center' },
    modalContainer: {
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
        padding: 16,
    },
    modalTitle: { fontSize: 18, color: '#FFF', textAlign: 'center', marginBottom: 10 },
    input: { backgroundColor: '#fff', marginVertical: 8, padding: 12, borderRadius: 4 },
    modalActions: { flexDirection: 'column', justifyContent: 'space-around' },
    loadingText: { textAlign: 'center', color: 'gray', marginBottom: 10 },
    item: { marginBottom: 16, padding: 16, backgroundColor: '#f9f9f9', borderRadius: 8 },
    listItem: {
        padding: 10,
        borderWidth: 1,
        borderRadius: 5,
        marginVertical: 5,
        backgroundColor: '#f9f9f9',
    },
    ModalTitleView: {
        flexDirection: 'row',
        // backgroundColor:'#00C569'
    },
    copyTitle: {
        fontSize: 26, color: '#FFF', textAlign: 'center', marginBottom: 10,
        borderWidth: 1,
        borderRadius: 10,
        borderColor: 'white'
    },
    itemContent: {
        flexDirection: 'column',
        justifyContent: 'space-between',
    },
    deleteIconWrapper: {
        alignItems: 'flex-end'
    },
    deleteIcon: {
        width: 25,
        height: 25,
        marginEnd: 5,
        resizeMode: 'contain',
    },
});

export default Type5SaveScreen;