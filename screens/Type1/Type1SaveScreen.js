import { CommonActions, useNavigation, useRoute } from "@react-navigation/native";
import axios from "axios";
import { useEffect, useState } from "react";
import { Alert, Button, FlatList, Image, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

const API_BASE_URL = 'https://ims-api.nepra.co.in/api/company/v1/';
const API_ENDPOINTS = {
    TABLE_OCR: 'directory_table_extraction',
    SAVE_JSON: 'save-gspma-data',
    SYNC_DATA: 'get-gspma-data',
    GET_EXCEL: 'export-excel',
};
const Type1SaveScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { data, extractedData = [] } = route.params || {};
    const [listBlocks, setListBlocks] = useState([]);
    const [recognizedText, setRecognizedText] = useState('');
    const [selectedItem, setSelectedItem] = useState(null);
    const [isEditModalVisible, setEditModalVisible] = useState(false);
    const [isCopyModalVisible, setCopyModalVisible] = useState(false);  //Copy Dialog

    const [editedData, setEditedData] = useState({
        company_name_address: "",
        contact_person: "",
        phone_email: "",
        product_name: "",
    });

    const extractedtext = route?.params.recognizedText || ''
    const filePath = route?.params.croppedImageUri

    useEffect(() => {
        if (extractedData.length > 0) {
            setListBlocks(extractedData);
        } else {
            Alert.alert("No Data", "No valid data to display")
        }
    }, [data, extractedData]);


    //Open EditDialog
    const openEditDialog = (item, index) => {
        setSelectedItem({ ...item, index });
        setEditedData({ ...item, index });
        setEditModalVisible(true);
    };

    //Open CopyDialog
    const openCopyDialog = () => {
        setRecognizedText(extractedtext);
        setCopyModalVisible(true);
    };

    const saveEditDialogDetails = () => {
        if (selectedItem) {
            const updatedBlocks = [...listBlocks];
            updatedBlocks[selectedItem.index] = { ...editedData };
            setListBlocks(updatedBlocks); // Update the list
            setEditModalVisible(false); // Close modal
            setSelectedItem(null);
            setEditedData({
                company_name_address: "",
                contact_person: "",
                phone_email: "",
                product_name: "",
            });
        }
    };

    const renderItem = ({ item, index }) => (
        <TouchableOpacity
            style={styles.listItem}
            onPress={() => openEditDialog(item, index)}
        >
            <View style={styles.itemContent}>
                <View>
                    <Text>Company Name & Address: {item.company_name_address || ''}</Text>
                    <Text>Contact Person: {item.contact_person || ''}</Text>
                    <Text>Phone & Email: {item.phone_email || ''}</Text>
                    <Text>Product Name: {item.product_name || ''}</Text>
                </View>
                <TouchableOpacity onPress={() => deleteItem(index)} style={styles.deleteIconWrapper}>
                    <Image
                        source={require('../assets/delete_icon.png')} // Replace with your image path
                        style={styles.deleteIcon}
                    />
                </TouchableOpacity>
            </View>
        </TouchableOpacity >
    );

    const getJsonDataPlastivision = () => {
        const jsonArray = listBlocks.map((item) => {
            return {
                company_name_address: item.company_name_address,
                contact_person: item.contact_person,
                phone_email: item.phone_email,
                product_name: item.product_name,
            };
        })
        return JSON.stringify(jsonArray)
    }

    const testSaveJson = async () => {
        try {
            saveJson("", getJsonDataPlastivision(), filePath, filePath, "1")
        }
        catch (error) {
            Alert.alert("Error", error.message)
        }
    }

    //Delete the flatlist item
    const deleteItem = (indexToDelete) => {
        setListBlocks((prevlist) => prevlist.filter((_, index) => index !== indexToDelete));
    }

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

            console.log("Type1DATAAAAA", requestData)
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

    const retryProcess = () => {
        navigation.dispatch(CommonActions.reset({
            routes: [{ name: 'Type1ProcessScreen' }]
        }))
    };

    return (
        <View style={styles.container}>
            <FlatList
                data={listBlocks}
                keyExtractor={(item, index) => index.toString()}
                renderItem={renderItem}
            />

            <TouchableOpacity style={styles.button} onPress={testSaveJson} >
                <Text style={styles.buttonText}>Save Data</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={retryProcess}>
                <Text style={styles.buttonText}>Retry</Text>
            </TouchableOpacity>

            {/* Copy Modal */}
            <Modal visible={isCopyModalVisible} transparent={false} animationType="slide">
                <View style={[styles.modalContainer, { flex: 1 }]}>
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
                        <View >
                            <View style={{ flexDirection: 'column', flex: 1 }}>
                                <Text style={styles.modalTitle}>Edit Data</Text>
                                <TouchableOpacity onPress={() => openCopyDialog()}>
                                    <Text style={styles.copyTitle}>Copy Data</Text>
                                </TouchableOpacity>

                            </View>
                            <TextInput
                                style={styles.input}
                                placeholder="Company Name & Address"
                                multiline={true}
                                value={editedData?.company_name_address || ''}
                                onChangeText={(text) => setEditedData({ ...editedData, company_name_address: text })}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="Contact Person"
                                multiline={true}
                                value={editedData?.contact_person || ''}
                                onChangeText={(text) => setEditedData({ ...editedData, contact_person: text })}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="Phone & Email"
                                multiline={true}
                                value={editedData?.phone_email || ''}
                                onChangeText={(text) => setEditedData({ ...editedData, phone_email: text })}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="Product Name"
                                multiline={true}
                                value={editedData?.product_name || ''}
                                onChangeText={(text) => setEditedData({ ...editedData, product_name: text })}
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
    container: {
        flex: 1,
        padding: 16,
    },
    button: { padding: 12, backgroundColor: '#00C569', marginVertical: 8, borderRadius: 4 },
    buttonText: { color: '#fff', textAlign: 'center' },
    modalContainer: {
        // flex: 1,
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
        padding: 16,
    },
    modalTitle: { fontSize: 18, color: '#FFF', textAlign: 'center', marginBottom: 10 },
    input: { backgroundColor: '#fff', marginVertical: 8, padding: 12, borderRadius: 4 },
    modalActions: { flexDirection: 'column', justifyContent: 'space-around' },
    listItem: {
        padding: 10,
        borderWidth: 1,
        borderRadius: 5,
        marginVertical: 5,
        backgroundColor: '#f9f9f9',
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
export default Type1SaveScreen;