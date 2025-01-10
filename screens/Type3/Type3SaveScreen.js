import { useNavigation } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { Alert, Button, FlatList, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

const Type3SaveScreen = (route) => {
    const navigation = useNavigation();
    const [listBlocks, setListBlocks] = useState([]);
    const [recognizedText, setRecognizedText] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [currentEditItem, setCurrentEditItem] = useState(null);
    const [editDialogVisible, setEditDialogVisible] = useState(false);

    useEffect(() => {
        const { data, recognizeText } = route.params || {};
        setListBlocks(data || []);
        setRecognizedText(recognizeText || '');
    }, [route.params]);

    const saveJsonData = () => {
        const appFilePath = route.params?.appFilePath || '';
        const unorganizedJson = route.params?.unorganize_json || '';
        const pdfLink = route.params?.PDFLink || '';

        const jsonData = getJsonDataMemberData();

        // Perform save operation (e.g., API call or local save)
        Alert.alert('Data Saved', `JSON Data:\n${jsonData}`);
    };

    const getJsonDataMemberData = () => {
        return JSON.stringify(
            listBlocks.map(item => ({
                company_name_address: item.company_name_address,
                contact_person: item.contact_person,
                phone_email: item.phone_email,
                product_name: item.product_name,
            }))
        );
    };

    const openEditDialog = (item, index) => {
        setCurrentEditItem({ ...item, index });
        setEditDialogVisible(true);
    };

    const saveEditDialog = () => {
        if (currentEditItem !== null) {
            const updatedList = [...listBlocks];
            updatedList[currentEditItem.index] = {
                company_name_address: currentEditItem.company_name_address,
                contact_person: currentEditItem.contact_person,
                phone_email: currentEditItem.phone_email,
                product_name: currentEditItem.product_name,
            };
            setListBlocks(updatedList);
        }
        setEditDialogVisible(false);
    };

    return (
        <View style={styles.container}>
            {/* <FlatList
                data={listBlocks}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item, index }) => (
                    <TouchableOpacity
                        style={styles.listItem}
                        onPress={() => openEditDialog(item, index)}
                    >
                        <Text>Company: {item.company_name_address}</Text>
                        <Text>Contact: {item.contact_person}</Text>
                        <Text>Phone/Email: {item.phone_email}</Text>
                        <Text>Product: {item.product_name}</Text>
                    </TouchableOpacity>
                )}
            /> */}

            {/* <TouchableOpacity style={styles.saveButton} onPress={saveJsonData}>
                <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.retryButton} onPress={() => navigation.goBack()}>
                <Text style={styles.buttonText}>Retry</Text>
            </TouchableOpacity> */}

        </View>
    )
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    listItem: {
        padding: 10,
        borderWidth: 1,
        borderRadius: 5,
        marginVertical: 5,
        backgroundColor: '#f9f9f9',
    },
    saveButton: {
        backgroundColor: 'blue',
        padding: 15,
        borderRadius: 5,
        marginTop: 20,
    },
    retryButton: {
        backgroundColor: 'red',
        padding: 15,
        borderRadius: 5,
        marginTop: 10,
    },
    buttonText: {
        color: 'white',
        textAlign: 'center',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        width: '80%',
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
    },
    input: {
        borderWidth: 1,
        marginVertical: 10,
        padding: 10,
        borderRadius: 5,
    },
});
export default Type3SaveScreen;