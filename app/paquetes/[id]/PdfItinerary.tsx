//@ts-nocheck
"use client";

import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
    page: { flexDirection: 'column', backgroundColor: '#ffffff', padding: 30 },
    section: { margin: 10, padding: 10 },
    title: { fontSize: 24, marginBottom: 10 },
    subtitle: { fontSize: 18, marginBottom: 10 },
    text: { fontSize: 12, marginBottom: 5 },
    day: { marginTop: 15, marginBottom: 10 },
});

const ItineraryPDF = ({ tourPackage }) => (
    <Document>
        <Page style={styles.page}>
            <View style={styles.section}>
                <Text style={styles.title}>{tourPackage.title}</Text>
                <Text style={styles.subtitle}>{tourPackage.destination}</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.subtitle}>Itinerario</Text>
                {tourPackage.itinerary.map((day) => (
                    <View key={day.day.toString()} style={styles.day}>
                        <Text style={styles.text}>Día {day.day}: {day.title}</Text>
                        <Text style={styles.text}>{day.description}</Text>
                        {day.activities?.map((activity, index) => (
                            <Text key={index.toString()} style={styles.text}>
                                {activity.time}: {activity.description}
                            </Text>
                        ))}
                        <Text style={styles.text}>
                            Comidas incluidas: {[
                            day.meals?.breakfast && 'Desayuno',
                            day.meals?.lunch && 'Almuerzo',
                            day.meals?.dinner && 'Cena'
                        ].filter(Boolean).join(', ') || 'Ninguna'}
                        </Text>
                        <Text style={styles.text}>Alojamiento: {day.accommodation || 'No especificado'}</Text>
                    </View>
                ))}
            </View>

            <View style={styles.section}>
                <Text style={styles.subtitle}>Incluye</Text>
                {tourPackage.included.map((item, index) => (
                    <Text key={index.toString()} style={styles.text}>• {item}</Text>
                ))}
            </View>

            <View style={styles.section}>
                <Text style={styles.subtitle}>No Incluye</Text>
                {tourPackage.notIncluded.map((item, index) => (
                    <Text key={index.toString()} style={styles.text}>• {item}</Text>
                ))}
            </View>
        </Page>
    </Document>
);

export default ItineraryPDF;
