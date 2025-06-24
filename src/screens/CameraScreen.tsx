import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Image,
  ActivityIndicator,
  Button,
} from 'react-native';
import {
  CameraView,
  CameraType,
  PermissionStatus,
  useCameraPermissions,
} from 'expo-camera';

export default function CameraScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('back');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const cameraRef = useRef<CameraView | null>(null);

  // auto-request on first load
  useEffect(() => {
    if (permission?.status === PermissionStatus.UNDETERMINED) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  // loading state
  if (!permission) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>Checking permissions…</Text>
      </View>
    );
  }

  // not granted yet
  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.message}>
          We need your permission to show the camera
        </Text>
        <Button title="Grant permission" onPress={requestPermission} />
      </View>
    );
  }

  // flip between front/back
  const toggleFacing = () =>
    setFacing((current) => (current === 'back' ? 'front' : 'back'));

  // take the picture
  const takePhoto = async () => {
    if (cameraRef.current) {
      const shot = await cameraRef.current.takePictureAsync({ quality: 0.6 });
      setPhotoUri(shot.uri);
    }
  };

  // if we have a photo, show preview + “retake”
  if (photoUri) {
    return (
      <View style={styles.container}>
        <Image
          source={{ uri: photoUri }}
          style={styles.camera}
          resizeMode="cover"
        />
        <TouchableOpacity
          style={styles.capture}
          onPress={() => setPhotoUri(null)}
        >
          <Text style={styles.captureText}>Retake</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // otherwise show live camera feed
  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={facing}
      />
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={toggleFacing}>
          <Text style={styles.buttonText}>Flip</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={takePhoto}>
          <Text style={styles.buttonText}>Snap</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  camera: { flex: 1 },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
    fontSize: 16,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 40,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  button: {
    backgroundColor: '#0009',
    padding: 16,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
  },
  capture: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    backgroundColor: '#0009',
    padding: 20,
    borderRadius: 40,
  },
  captureText: { color: '#fff', fontSize: 16 },
});
