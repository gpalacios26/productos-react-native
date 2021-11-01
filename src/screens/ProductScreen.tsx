import React, { useContext, useEffect, useState } from 'react';
import { Text, View, StyleSheet, ScrollView, TextInput, Button, Image, Alert } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { Picker } from '@react-native-picker/picker';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { ProductsStackParams } from '../navigator/ProductsNavigator';
import { useCategories } from '../hooks/useCategories';
import { useForm } from '../hooks/useForm';
import { Loading } from '../components/Loading';
import { ProductsContext } from '../context/ProductsContext';

interface Props extends StackScreenProps<ProductsStackParams, 'ProductScreen'> { };

export const ProductScreen = ({ navigation, route }: Props) => {

    const { id = '', name = '' } = route.params;

    const [isLoading, setIsLoading] = useState(false);
    const [tempUri, setTempUri] = useState<string>();

    const { categories } = useCategories();
    const { loadProductById, addProduct, updateProduct, uploadImage } = useContext(ProductsContext);

    const { _id, categoriaId, nombre, img, onChange, setFormValue } = useForm({
        _id: id,
        categoriaId: '',
        nombre: name,
        img: ''
    });

    useEffect(() => {
        navigation.setOptions({
            title: (nombre) ? nombre : 'Sin nombre de producto'
        });
    }, [nombre]);

    useEffect(() => {
        loadProduct();
    }, []);

    const loadProduct = async () => {
        if (id.length === 0) return;

        setIsLoading(true);
        const product = await loadProductById(id);
        if (product) {
            setTimeout(() => {
                setFormValue({
                    _id: id,
                    categoriaId: product.categoria._id,
                    img: product.img || '',
                    nombre
                });

                setIsLoading(false);
            }, 100);
        } else {
            setIsLoading(false);
        }
    }

    const saveOrUpdate = async () => {
        setIsLoading(true);

        if (id.length > 0) {
            updateProduct(categoriaId, nombre, id);

            Alert.alert('Actualizar', 'Datos actualizados correctamente', [{
                text: 'Ok',
                onPress: () => navigation.navigate('ProductsScreen')
            }]);
        } else {
            const tempCategoriaId = categoriaId || categories[0]._id;
            const newProduct = await addProduct(tempCategoriaId, nombre);
            onChange(newProduct._id, '_id');

            Alert.alert('Registrar', 'Datos registrados correctamente', [{
                text: 'Ok',
                onPress: () => navigation.navigate('ProductsScreen')
            }]);
        }

        setIsLoading(false);
    }

    const takePhoto = () => {
        launchCamera({
            mediaType: 'photo',
            quality: 0.5
        }, (resp: any) => {
            if (resp.didCancel) return;
            if (!resp.assets[0].uri) return;

            setIsLoading(true);
            setTempUri(resp.assets[0].uri);
            uploadImage(resp.assets[0], _id);
            setIsLoading(false);

            Alert.alert('Subir Foto', 'Foto subida correctamente', [{
                text: 'Ok'
            }]);
        });
    }

    const takePhotoFromGallery = () => {
        launchImageLibrary({
            mediaType: 'photo',
            quality: 0.5
        }, (resp: any) => {
            if (resp.didCancel) return;
            if (!resp.assets[0].uri) return;

            setIsLoading(true);
            setTempUri(resp.assets[0].uri);
            uploadImage(resp.assets[0], _id);
            setIsLoading(false);

            Alert.alert('Subir Foto', 'Foto subida correctamente', [{
                text: 'Ok'
            }]);
        });
    }

    if (isLoading) return <Loading />

    return (
        <View style={styles.container}>
            <ScrollView>
                <Text style={styles.label}>Nombre del producto:</Text>
                <TextInput
                    placeholder="Producto"
                    style={styles.textInput}
                    value={nombre}
                    onChangeText={(value) => onChange(value, 'nombre')}
                />

                <Text style={styles.label}>Categoría:</Text>
                <Picker
                    selectedValue={categoriaId}
                    onValueChange={(value) => onChange(value, 'categoriaId')}
                >
                    {
                        categories.map(c => (
                            <Picker.Item
                                label={c.nombre}
                                value={c._id}
                                key={c._id}
                            />
                        ))
                    }
                </Picker>

                <Button
                    title="Guardar"
                    onPress={saveOrUpdate}
                    color="#5856D6"
                />
                {
                    (_id.length > 0) && (
                        <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 10 }}>
                            <Button
                                title="Cámara"
                                onPress={takePhoto}
                                color="#5856D6"
                            />
                            <View style={{ width: 10 }} />
                            <Button
                                title="Galería"
                                onPress={takePhotoFromGallery}
                                color="#5856D6"
                            />
                        </View>
                    )
                }
                {
                    (img.length > 0 && !tempUri) && (
                        <Image
                            source={{ uri: img }}
                            style={{
                                marginTop: 20,
                                width: '100%',
                                height: 300
                            }}
                        />
                    )
                }
                {
                    (tempUri) && (
                        <Image
                            source={{ uri: tempUri }}
                            style={{
                                marginTop: 20,
                                width: '100%',
                                height: 300
                            }}
                        />
                    )
                }
            </ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginTop: 10,
        marginHorizontal: 20
    },
    label: {
        fontSize: 18
    },
    textInput: {
        borderWidth: 1,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 20,
        borderColor: 'rgba(0,0,0,0.2)',
        height: 45,
        marginTop: 5,
        marginBottom: 15
    }
});
