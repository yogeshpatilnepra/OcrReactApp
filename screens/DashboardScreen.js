import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import { useState } from "react";
import { ActivityIndicator, Alert, FlatList, Image, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

const DashboardScreen = () => {
    const GET_EXCEL = "export-excel"
    const BASE_URL = "https://ims-api.nepra.co.in/api/company/v1/"
    const SYNC_DATA = "get-gspma-data"
    const navigation = useNavigation();
    const [loading, setLoading] = useState(false);

    //custom data for create the flatlist.
    const [dashboardItems] = useState([
        { id: '1', title: 'Guj. State Plastics\nMember List' },
        { id: '2', title: 'Plastivision\nExhibitor Directory' },
        { id: '3', title: 'TAPMA\nMembers Directory' },
        { id: '4', title: 'AIPMA\nMembers Directory' },
        { id: '5', title: 'Sanand Industries Association\nDirectory' },
    ]);

    const [emailModalVisible, setEmailModalVisible] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [email, setEmail] = useState('');

    //handle start process type wise
    const handleStartProcess = (itemId) => {
        switch (itemId) {
            case '1':
                navigation.navigate('Type1ProcessScreen');
                break;
            case '2':
                navigation.navigate('Type2ProcessScreen');
                break;
            case '3':
                navigation.navigate('Type3ProcessScreen');
                break;
            case '4':
                navigation.navigate('Type4ProcessScreen');
                break;
            case '5':
                navigation.navigate('Type5ProcessScreen');
                break;
            default:
                Alert.alert('Unknown process');
        }
    };

    //open email dialog code for send the email

    const openEmailModal = (itemId) => {
        setSelectedItem(itemId);
        setEmailModalVisible(true);
    };

    //handle email click
    const handleSendEmail = () => {
        if (!email) {
            Alert.alert('Error', 'Please enter an email address.');
            return;
        }
        if (!/\S+@\S+\.\S+/.test(email)) {
            Alert.alert('Error', 'Please enter a valid email address.');
            return;
        }
        openEmailSent(selectedItem)

    };

    //type wise send email
    const openEmailSent = async (type) => {
        switch (type) {
            case '1': {
                try {
                    await sendEmail(type, email)
                } catch (error) {
                    Alert.alert(`Failed to send email: ${error.message}`);
                }
            }
                break;
            case '2': {
                try {
                    await sendEmail(type, email)
                } catch (error) {
                    Alert.alert(`Failed to send email: ${error.message}`);
                }
            }
                break;
            case '3': {
                try {
                    await sendEmail(type, email)
                } catch (error) {
                    Alert.alert(`Failed to send email: ${error.message}`);
                }
            }
                break;
            case '4': {
                try {
                    await sendEmail(type, email)
                } catch (error) {
                    Alert.alert(`Failed to send email: ${error.message}`);
                }
            }
                break;
            case '5': {
                try {
                    await sendEmail(type, email)
                } catch (error) {
                    Alert.alert(`Failed to send email: ${error.message}`);
                }
            }
                break;
            default:
                Alert.alert('Unknown process');
        }
    }
    //for send email
    const sendEmail = async (mtype, memail) => {
        setEmailModalVisible(false)
        setLoading(true);
        try {
            const request = {
                type: mtype,
                email: memail
            }

            const response = await axios.post(`${BASE_URL}${GET_EXCEL}`, request, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.status === 200) {
                setLoading(false);
                setEmail('');
                Alert.alert(`Email Sent: ${response.data.msg}`)
                return response.data.msg;
            } else {
                Alert.alert(`Error: No Data Available`)
                throw new Error("No Data Available");
            }
        } catch (error) {
            throw error;
        }
    }

    //for sync the data type wise
    const syncData = async () => {

        try {
            //pass the data in api usign this request paramater
            console.log("SELECTEDITEMM", selectedItem)
            const request = {
                type: selectedItem,
            }

            //post data
            const response = await axios.post(`${BASE_URL}${SYNC_DATA}`, request, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            // handle response with status
            if (response.status === 200) {
                Alert.alert(`${response.data.msg}`)
                return response.data.msg;
            } else {
                Alert.alert(`Error: No Data Available`)
                throw new Error("No Data Available");
            }

        } catch (error) {
            Alert.alert("Error", error.message)
        }
    }

    //renderitem for set the data into the list with views
    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <Text style={styles.itemTitle}>{item.title}</Text>
            <View style={styles.actions}>
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleStartProcess(item.id)}
                >
                    <Text style={styles.actionText}>Start Process</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => openEmailModal(item.id)}
                >
                    <Text style={styles.actionText}>Email</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            {/* FlatList for dashboard items */}

            {loading ? (
                <ActivityIndicator size={'large'} color={'#00c569'} />
            ) : (
                <Text style={styles.sendButtonText}></Text>
            )}

            <FlatList
                data={dashboardItems}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
            />

            <TouchableOpacity style={styles.syncButton} onPress={syncData}>
                <Image
                    source={require('./assets/sync_img.png')}
                    style={styles.syncIcon}
                />
            </TouchableOpacity>

            {/* Email Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={emailModalVisible}
                onRequestClose={() => setEmailModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Enter Email</Text>
                        <TextInput
                            style={styles.emailInput}
                            placeholder="Enter email address"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                        />
                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={() => setEmailModalVisible(false)}
                            >
                                <Text style={styles.buttonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.sendButton]}
                                onPress={handleSendEmail}
                            >
                                <Text style={styles.buttonText}>Send</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        // alignItems: 'center',
        backgroundColor: '#ffffff',
        padding: 15,
    },
    text: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    rowDashboard: {
        height: 50,
        marginBottom: 10,
        backgroundColor: '#F0F0F0',
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    syncButton: {
        position: 'absolute',
        bottom: 5,
        right: 20,
        width: 55,
        height: 55,
        backgroundColor: '#00C569',
        borderRadius: 55 / 2,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    syncIcon: {
        width: 25,
        height: 25,
        tintColor: '#FFFFFF', // White color
    },
    card: {
        backgroundColor: '#F9F9F9',
        padding: 15,
        marginBottom: 10,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    itemTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    actionButton: {
        padding: 10,
        backgroundColor: '#00C569',
        borderRadius: 5,
    },
    actionText: {
        color: '#FFF',
        fontSize: 14,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: '80%',
        backgroundColor: '#FFF',
        padding: 20,
        borderRadius: 10,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    emailInput: {
        borderWidth: 1,
        borderColor: '#CCC',
        borderRadius: 5,
        padding: 10,
        marginBottom: 20,
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    modalButton: {
        padding: 10,
        borderRadius: 5,
    },
    cancelButton: {
        backgroundColor: '#F44336',
    },
    sendButton: {
        backgroundColor: '#4CAF50',
    },
    buttonText: {
        color: '#FFF',
        fontSize: 14,
    },
    sendButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
        alignSelf: 'center'
    },
});
export default DashboardScreen;