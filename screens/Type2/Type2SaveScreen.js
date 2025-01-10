import { useNavigation, useRoute } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { Alert, Button, FlatList, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

const Type2SaveScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { data, extractedData = [], recognizedText = '' } = route.params || {};
    const [listBlocks, setListBlocks] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);
    const [isEditModalVisible, setEditModalVisible] = useState(false);
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
    // const extractedtext = route?.params.recognizedText || ''
    //filepath url
    const filePath = route?.params.croppedImageUri

    useEffect(() => {
        console.log('Received data:', data);
        console.log('Extracted data:', extractedData);
        if (data) {
            setListBlocks(data);
        } else if (extractedData.length > 0) {
            setListBlocks(extractedData);
        } else {
            console.log('No valid data to display');
        }
    }, [data, extractedData]);

    const openEditDialog = (item, index) => {
        setSelectedItem({ ...item, index });
        setEditedData({ ...item, index });
        setEditModalVisible(true);
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
            <Text>Name: {item.name || ''}</Text>
            <Text>Address: {item.address || ''}</Text>
            <Text>Contact: {item.contact || ''}</Text>
            <Text>Email: {item.email || ''}</Text>
            <Text>Website: {item.website || ''}</Text>
            <Text>Contact Person: {item.contact_person || ''}</Text>
            <Text>Product Service: {item.product_service || ''}</Text>
        </TouchableOpacity>
    );

    const testSaveJson = async () => {
        try {
            saveJson("", getJsonDataPlastivision(), filePath, filePath, "5")
        }
        catch (error) {
            console.log("Error", error.message)
        }
    }
    return (
        <View style={styles.container}>
            <FlatList
                data={listBlocks}
                keyExtractor={(item, index) => index.toString()}
                renderItem={renderItem}
            />

            {/* <TouchableOpacity style={styles.button} onPress={testSaveJson} >
                <Text style={styles.buttonText}>Save Data</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button}>
                <Text style={styles.buttonText}>Retry</Text>
            </TouchableOpacity> */}

            {/* Edit Modal */}
            <Modal visible={isEditModalVisible} transparent={true} animationType="slide">
                <ScrollView contentContainerStyle={styles.modalContainer}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>Edit Entry</Text>
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
        flex: 1,
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
        padding: 16,
    },
    modalTitle: { fontSize: 18, color: '#FFF', textAlign: 'center', marginBottom: 10 },
    input: { backgroundColor: '#fff', marginVertical: 8, padding: 12, borderRadius: 4 },
    modalActions: { flexDirection: 'column', justifyContent: 'space-around' },
    loadingText: { textAlign: 'center', color: 'gray', marginBottom: 10 },
    item: { marginBottom: 16, padding: 16, backgroundColor: '#f9f9f9', borderRadius: 8 },
    itemDetails: {
        fontSize: 14,
        color: '#555',
        marginTop: 4,
    },

    dialogBox: {
        width: '80%',
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 20,
        alignItems: 'center',
    },
    dialogTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    dialogActions: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
    },
    saveButton: {
        backgroundColor: '#4CAF50',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
    cancelButton: {
        backgroundColor: '#f44336',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
    },

    listItem: {
        padding: 10,
        borderWidth: 1,
        borderRadius: 5,
        marginVertical: 5,
        backgroundColor: '#f9f9f9',
    },
});
export default Type2SaveScreen;