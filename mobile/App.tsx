import { View, Text, StyleSheet } from 'react-native';
import { colors } from './constants/theme';

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Laklak 🎉</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: colors.textPrimary,
    fontSize: 28,
    fontWeight: '500',
  },
});