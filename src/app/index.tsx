import Map from '@/screens/Map';
import { StyleSheet, View } from 'react-native';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Map></Map>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
