import { CurrentRenderContext, LinkingContext, useNavigation } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { Alert, Button, FlatList, Image, LogBox, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import ImageCropPicker from "react-native-image-crop-picker";
import MLKit from "react-native-mlkit-ocr";
import Type4 from "../models/Type4";
import { ComposedGesture } from "react-native-gesture-handler/lib/typescript/handlers/gestures/gestureComposition";

const Type4ProcessScreen = () => {
    const navigation = useNavigation();
    const [croppedImageUri, setCroppedImageUri] = useState('');
    const [extractedData, setExtractedData] = useState([])
    const [modalVisible, setModalVisible] = useState(false);
    const [recognizedText, setRecognizedText] = useState('');
    const [filePath, setFilePath] = useState('');

    // new for listblocks
    const [listBlocks, setListBlocks] = useState([]);

    //ocr start code
    const processOCR = async () => {
        const type4 = new Type4();
        try {
            setListBlocks([])
            const result = await MLKit.detectFromFile(croppedImageUri);
            const recognizedText = result.map(block => block.text).join('\n');
            setFilePath(croppedImageUri)
            setRecognizedText(recognizedText);
            const lines = recognizedText.split("\n")

            // const data = getName(recognizedText)
            getName(recognizedText)
            // type4.setData(data)
            // setExtractedData(type4)
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

    //------------------------Regex functions---------------//
    const getName = (data) => {
        data = recognizedText.split("\n")
        let lastPosition = 0;
        let name = '';
        let isNameFound = false;
        let membershipNo = '';
        let address = '';
        let isAddressFound = false;
        let gst = '';
        let telNo = '';
        let fax = '';
        let email = '';
        let website = '';
        let contact_person = '';
        let isContactPersonFound = false;
        let industrycategory = '';
        let product = '';
        let isProductFound = false;
        let hsncode = '';

        for (let i = 0; i < data.length; i++) {
            const line = data[i].toLowerCase();

            if ((line.toLowerCase().includes('membership') || line.toLowerCase().includes('member')) && membershipNo === '') {
                isNameFound = true;
                membershipNo = data[i];
            }
            if (!isNameFound) name += data[i];

            if (line.includes('gst') && gst === '') gst = data[i];

            if (membershipNo !== '' && !isAddressFound && gst === '') {
                address += address === '' ? data[i + 1] : data[i];
            }

            if (line.replace(' ', '').includes('tel.') && telNo === '') telNo = data[i];

            if (line.replace(' ', '').includes('fax') && fax === '') fax = data[i];

            if (line.replace(' ', '').includes('email') && email === '') email = data[i];

            if (line.replace(' ', '').includes('website') && website === '') website = data[i];

            if (line.replace(' ', '').includes('industry') && industrycategory === '') industrycategory = data[i];


            if (website !== '' && !isContactPersonFound && industrycategory === '') {
                contact_person += contact_person === '' ? data[i + 1] : data[i];
            }

            if ((line.replace(' ', '').includes('hsncode') || line.replace(' ', '').includes('hsnc0de')) && hsncode === '') {
                hsncode = data[i];
                lastPosition = i;
                break;
            }

            if (industrycategory !== '' && !isProductFound && hsncode === '') {
                product += product === '' ? data[i + 1] : data[i];
            }
        }

        membershipNo = membershipNo.toUpperCase().replace('MEMBERSHIP NO.:', '').replace('MEMBER', '');
        address = address.toUpperCase().replace('ADDRESS:', '');
        gst = gst.toUpperCase().replace('GST NO.:', '');
        telNo = telNo.toUpperCase().replace('TEL. NO.:', '');
        fax = fax.toUpperCase().replace('FAX', '').replace(':', '');
        email = email.toLowerCase().replace('email', '').replace(':', '');
        website = website.toLowerCase().replace('website', '').replace(':', '');
        contact_person = contact_person
            .toUpperCase()
            .replace('CONTACT PERSON', '')
            .replace(':', '')
            .replace('C0NTACT PERSON', '')
            .replace(':', '');
        industrycategory = industrycategory
            .toUpperCase()
            .replace('INDUSTRY CATEGORY', '')
            .replace('INDUSTRY CATEG0RY', '')
            .replace(':', '');
        hsncode = hsncode.toUpperCase().replace(' ', '').replace('HSNCODE:', '').replace('HSNC0DE:', '');
        product = product.toUpperCase()
            .replace('PRODUCT:', '')
            .replace('PR0DUCT:', '')
            .replace('MOB.:', '')
            .replace('M0B.:', '')
            .replace('HSN CODE:', '')
            .replace('HSN C0DE:', '');
        const updatedList1 = [
            {
                name,
                membershipNo,
                address,
                gst,
                telNo,
                fax,
                email,
                website,
                contact_person,
                industrycategory,
                product,
                hsncode,
            },
        ];

        setListBlocks((prevBlocks) => [...prevBlocks, ...updatedList1]);
        getname2(data, lastPosition);
    }
    const getname2 = (data, lastpos) => {
        data = recognizedText.split("\n")
        let name = '';
        let membershipNo = '';
        let address = '';
        let gst = '';
        let telNo = '';
        let fax = '';
        let email = '';
        let website = '';
        let contact_person = '';
        let industrycategory = '';
        let product = '';
        let hsncode = '';

        for (let i = lastpos; i < data.length; i++) {
            const line = data[i].toLowerCase();

            if ((line.includes('membership') || line.includes('member')) && membershipNo === '') {
                membershipNo = data[i];
                if (name === '') {
                    const a = data[i - 1];
                    let b = '';
                    if (
                        !(
                            data[i - 2].toLowerCase().replace(' ', '').includes('hsncode') ||
                            data[i - 2].toLowerCase().replace(' ', '').includes('hsn c0de')
                        )
                    ) {
                        b = data[i - 2];
                    }
                    name = b + a;
                }
            }

            if (line.includes('gst') && gst === '') gst = data[i];

            if (membershipNo !== '' && address === '' && gst === '') {
                address += data[i + 1].replace('ADDRESS:', '');
            } else if (membershipNo !== '' && gst === '') {
                address += data[i].replace('ADDRESS:', '');
            }

            if (line.replace(' ', '').includes('tel.') && telNo === '') telNo = data[i];
            if (line.replace(' ', '').includes('fax') && fax === '') fax = data[i];
            if (line.replace(' ', '').includes('email') && email === '') email = data[i];
            if (line.replace(' ', '').includes('website') && website === '') website = data[i];
            if (line.replace(' ', '').includes('industry') && industrycategory === '') industrycategory = data[i];

            if (website !== '' && contact_person === '' && industrycategory === '') {
                contact_person += data[i + 1];
            } else if (website !== '' && industrycategory === '') {
                contact_person += data[i];
            }

            if ((line.replace(' ', '').includes('hsncode') || line.replace(' ', '').includes('hsnc0de')) && hsncode === '') {
                hsncode += data[i];
            }

            if (industrycategory !== '' && product === '') {
                product += data[i - 1];
            } else if (industrycategory !== '') {
                product += data[i];
            }
        }

        membershipNo = membershipNo.toUpperCase().replace('MEMBERSHIP NO.:', '').replace('MEMBER', '');
        address = address.toUpperCase().replace('ADDRESS:', '');
        gst = gst.toUpperCase().replace('GST NO.:', '');
        telNo = telNo.toUpperCase().replace('TEL. NO.:', '');
        fax = fax.toUpperCase().replace('FAX', '').replace(':', '');
        email = email.toLowerCase().replace('email', '').replace(':', '');
        website = website.toLowerCase().replace('website', '').replace(':', '');
        contact_person = contact_person
            .toUpperCase()
            .replace('CONTACT PERSON', '')
            .replace(':', '')
            .replace('C0NTACT PERSON', '')
            .replace(':', '');
        industrycategory = industrycategory
            .toUpperCase()
            .replace('INDUSTRY CATEGORY', '')
            .replace('INDUSTRY CATEG0RY', '')
            .replace(':', '');
        hsncode = hsncode.toUpperCase().replace(' ', '').replace('HSNCODE:', '').replace('HSNC0DE:', '');
        product = product.toUpperCase()
            .replace('PRODUCT:', '')
            .replace('PR0DUCT:', '')
            .replace('MOB.:', '')
            .replace('M0B.:', '')
            .replace('HSN CODE:', '')
            .replace('HSN C0DE:', '');
        const updatedList2 = [
            {
                name,
                membershipNo,
                address,
                gst,
                telNo,
                fax,
                email,
                website,
                contact_person,
                industrycategory,
                product,
                hsncode,
            },
        ];
        setListBlocks((prevBlocks) => [...prevBlocks, ...updatedList2])
        setTimeout(() => {
            navigation.navigate('Type4SaveScreen', {
                extractedData: listBlocks,
                croppedImageUri: filePath,
                recognizedText: recognizedText,
            });
        }, 500);
    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Type4 Process</Text>
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
export default Type4ProcessScreen;