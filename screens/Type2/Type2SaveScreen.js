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

const Type2SaveScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { data, extractedData = [] } = route.params || {};
    const [listBlocks, setListBlocks] = useState([]);
    const [recognizedText, setRecognizedText] = useState(''); // Recognized text
    const [selectedItem, setSelectedItem] = useState(null);
    const [isEditModalVisible, setEditModalVisible] = useState(false);
    const [isCopyModalVisible, setCopyModalVisible] = useState(false);  //Copy Dialog
    const [editedData, setEditedData] = useState({
        name: "",
        address: "",
        contact: "",
        email: "",
        website: "",
        contact_person: "",
        product_service: "",
    });

    //type2 process data
    // const extractedData = route?.params?.extractedData || [];
    // //extracted text from the 
    const extractedtext = route?.params.recognizedText || ''
    //filepath url
    const filePath = route?.params.croppedImageUri

    useEffect(() => {
        if (extractedData.length > 0) {
            setListBlocks(extractedData);
        } else {
            console.log('No valid data to display');
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
            console.log("Updated ListBlocks: ", updatedBlocks);
            setEditModalVisible(false); // Close modal
            setSelectedItem(null);
            setEditedData({
                name: "",
                address: "",
                contact: "",
                email: "",
                website: "",
                contact_person: "",
                product_service: "",
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
                    <Text>Name: {item.name || ''}</Text>
                    <Text>Address: {item.address || ''}</Text>
                    <Text>Contact: {item.contact || ''}</Text>
                    <Text>Email: {item.email || ''}</Text>
                    <Text>Website: {item.website || ''}</Text>
                    <Text>Contact Person: {item.contact_person || ''}</Text>
                    <Text>Product Service: {item.product_service || ''}</Text>
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
                name: item.name,
                address: item.address,
                contact: item.contact,
                email: item.email,
                website: item.website,
                contact_person: item.contact_person,
                product_service: item.product_service,
            };
        })
        return JSON.stringify(jsonArray)
    }

    const testSaveJson = async () => {
        try {
            saveJson("", getJsonDataPlastivision(), filePath, filePath, "2")
        }
        catch (error) {
            console.log("Error", error.message)
        }
    }

     //Delete the flatlist item
     const deleteItem = (indexToDelete) => {
        setListBlocks((prevlist) => prevlist.filter((_,index) => index!== indexToDelete));
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

            // console.log("Type2DATAAAAA",requestData)
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
            routes: [{ name: 'Type2ProcessScreen' }]
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
                <View style={[styles.modalContainer,{ flex: 1 }]}>
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
                        <View style={{ flexDirection: 'column',flex: 1 }}>
                            <Text style={styles.modalTitle}>Edit Data</Text>
                            <TouchableOpacity onPress={() => openCopyDialog()}>
                                <Text style={styles.copyTitle}>Copy Data</Text>
                            </TouchableOpacity>

                        </View>
                        <TextInput
                            style={styles.input}
                            placeholder=""
                            value={editedData?.name || ''}
                            onChangeText={(text) => setEditedData({ ...editedData, name: text })}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Address"
                            value={editedData?.address || ''}
                            onChangeText={(text) => setEditedData({ ...editedData, address: text })}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Contact"
                            value={editedData?.contact || ''}
                            onChangeText={(text) => setEditedData({ ...editedData, contact: text })}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Email"
                            value={editedData?.email || ''}
                            onChangeText={(text) => setEditedData({ ...editedData, email: text })}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Website"
                            value={editedData?.website || ''}
                            onChangeText={(text) => setEditedData({ ...editedData, website: text })}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Contact Person"
                            value={editedData?.contact_person || ''}
                            onChangeText={(text) => setEditedData({ ...editedData, contact_person: text })}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Product Service"
                            multiline={true}
                            value={editedData?.product_service || ''}
                            onChangeText={(text) => setEditedData({ ...editedData, product_service: text })}
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
        alignItems:'flex-end'
    },
    deleteIcon: {
        width: 25,
        height: 25,
        marginEnd: 5,
        resizeMode: 'contain',
    },
});
export default Type2SaveScreen;