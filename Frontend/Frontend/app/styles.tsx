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
    fontFamily: 'Gotham-Bold',
  },
  image: {
    width: 100,
    resizeMode: 'contain',
  },
  app_name: {
    fontSize: 33,
    fontFamily: 'Gotham-Bold',
  },
  summarySection: {
  marginBottom: 16,
  padding: 12,
  backgroundColor: '#fff',
  borderRadius: 10,
  borderLeftWidth: 5,
  borderLeftColor: '#9fbf2a',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.08,
  shadowRadius: 4,
  elevation: 2,
},

summarySectionTitle: {
  fontSize: 18,
  fontWeight: 'bold',
  marginBottom: 6,
  fontFamily: 'Gotham-Bold',
  color: '#333',
},

summarySectionText: {
  fontSize: 15,
  lineHeight: 18,
  fontFamily: 'Gotham',
  textAlign: 'left',
  color: '#555',
},

  error: {
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
    fontFamily: 'Gotham',
  },
});
