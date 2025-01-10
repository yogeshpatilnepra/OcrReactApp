import { CurrentRenderContext, useNavigation } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { Alert, Button, FlatList, Image, LogBox, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import ImageCropPicker from "react-native-image-crop-picker";
import MLKit from "react-native-mlkit-ocr";
import Type2 from "../models/Type2";

const Type3ProcessScreen = () => {
    const navigation = useNavigation();
    const [croppedImageUri, setCroppedImageUri] = useState('');
    const [extractedData, setExtractedData] = useState([])
    const [modalVisible, setModalVisible] = useState(false);
    const [recognizedText, setRecognizedText] = useState('');

    // new for listblocks
    const [listBlocks, setListBlocks] = useState([]);
    const [listName, setListName] = useState([]);
    const [listAddress, setListAddress] = useState([]);
    const [listContact, setListContact] = useState([]);
    const [listEmail, setListEmail] = useState([]);
    const [listWebsite, setListWebsite] = useState([]);
    const [listContactPerson, setListContactPerson] = useState([]);
    const [listProductService, setListProductService] = useState([]);

    //ocr start code
    const processOCR = async () => {
        const type2 = new Type2();
        try {
            const result = await MLKit.detectFromFile(croppedImageUri);
            const recognizedText = result.map(block => block.text).join('\n');
            setRecognizedText(recognizedText);
            const lines = recognizedText.split("\n")
            console.log('Lines:', lines)

            // const data = getName(lines)
            // type2.setData(data)
            // setExtractedData(type2)
            Alert.alert('OCR Complete', 'Text recognized successfully.');
            setExtractedData([]);
        } catch (error) {
            console.error('Error with OCR:', error.message);
        }
    };
    const openCamera = () => {
        ImageCropPicker.openCamera({
            cropping: true,
        }).then(image => {
            setCroppedImageUri(image.path);
        });
        setModalVisible(false);
    };

    const openGallery = () => {
        ImageCropPicker.openPicker({
            cropping: true,
        }).then(image => {
            setCroppedImageUri(image.path);
        });
        setModalVisible(false);
    };

    return (
        //new updated code at 08-01-2025 after 5 pm
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Type3 Process</Text>
            <Button title="Select & Crop Image" onPress={() => setModalVisible(true)} />
            <Image
                source={{ uri: croppedImageUri }}
                style={styles.syncIcon}
            />
            <Button title="Run OCR" onPress={processOCR} disabled={!croppedImageUri} />
            {recognizedText ? <Text style={styles.text}>Recognized Text: {recognizedText}</Text> : null}

            <Modal
                transparent={true}
                animationType="fade"
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                    <View style={{ backgroundColor: 'white', padding: 30, borderRadius: 10, alignItems: 'center' }}>
                        <Text>Select an option:</Text>
                        <TouchableOpacity onPress={openCamera} style={{ marginVertical: 10 }}>
                            <Text style={{ color: 'green', fontSize: 18 }}>Open Camera</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={openGallery} style={{ marginVertical: 10 }}>
                            <Text style={{ color: 'green', fontSize: 18 }}>Open Gallery</Text>
                        </TouchableOpacity>
                        <View style={{ width: 120, height: 40, marginTop: 15, alignItems: 'center' }}>
                            <Button title="Cancel" onPress={() => setModalVisible(false)} />
                        </View>
                    </View>
                </View>
            </Modal>
        </ScrollView>
    )
}
const styles = StyleSheet.create({
    container: {
        padding: 20,
    },
    text: {
        marginTop: 10,
        fontSize: 16,
        borderWidth: 1,
        borderRadius: 5,
        marginVertical: 5,
        padding: 10
    },
    header: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    syncIcon: {
        margin: 10,
        width: "100%",
        height: 300,
        resizeMode: 'contain'
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
    },
})
export default Type3ProcessScreen;