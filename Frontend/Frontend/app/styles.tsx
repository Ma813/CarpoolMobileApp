import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 100,
    backgroundColor: '#fff',
  },
  button: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#9fbf2a',
    color: 'black',
  },
  welcomeText: {
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
    alignSelf: 'center',
    position: 'absolute',
    top: '50%',
    transform: [{ translateY: -15 }], // Adjust based on actual height
    fontFamily: 'Gotham-Bold',
  },
  image: {
    width: 100,
    resizeMode: 'contain',
  },
  app_name: {
    fontSize: 33,
    fontFamily: 'Gotham-bold',
  },
});