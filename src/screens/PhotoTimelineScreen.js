 
import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  FlatList
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function PhotoTimelineScreen({ route }) {
  const { plant } = route.params;
  const photos = plant.photos || [];

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const getTimeDifference = (timestamp) => {
    const days = Math.floor((Date.now() - new Date(timestamp)) / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return '1 day ago';
    if (days < 30) return `${days} days ago`;
    const months = Math.floor(days / 30);
    return months === 1 ? '1 month ago' : `${months} months ago`;
  };

  const renderPhoto = ({ item, index }) => (
    <View key={item.id} style={timelineStyles.photoCard}>
      <Image source={{ uri: item.uri }} style={timelineStyles.photo} />
      <View style={timelineStyles.photoInfo}>
        <Text style={timelineStyles.photoDate}>{formatDate(item.timestamp)}</Text>
        <Text style={timelineStyles.photoTime}>{getTimeDifference(item.timestamp)}</Text>
        {index === 0 && (
          <View style={timelineStyles.latestBadge}>
            <Text style={timelineStyles.latestText}>Latest</Text>
          </View>
        )}
      </View>
    </View>
  );

  if (photos.length === 0) {
    return (
      <SafeAreaView style={timelineStyles.container}>
        <View style={timelineStyles.emptyContainer}>
          <Ionicons name="camera-outline" size={80} color="#d1d5db" />
          <Text style={timelineStyles.emptyTitle}>No photos yet</Text>
          <Text style={timelineStyles.emptyText}>
            Start documenting {plant.name}'s growth by taking photos from the plant details screen
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={timelineStyles.container}>
      <View style={timelineStyles.header}>
        <Text style={timelineStyles.headerTitle}>{plant.name} Timeline</Text>
        <Text style={timelineStyles.headerSubtitle}>
          {photos.length} photos • {getTimeDifference(photos[0]?.timestamp)} to now
        </Text>
      </View>

      <FlatList
        data={photos.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))}
        renderItem={renderPhoto}
        keyExtractor={(item) => item.id}
        contentContainerStyle={timelineStyles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const timelineStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    padding: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  listContainer: {
    padding: 16,
    paddingTop: 0,
  },
  photoCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    overflow: 'hidden',
  },
  photo: {
    width: '100%',
    height: 300,
    resizeMode: 'cover',
  },
  photoInfo: {
    padding: 16,
  },
  photoDate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  photoTime: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  latestBadge: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  latestText: {
    color: '#166534',
    fontSize: 12,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#9ca3af',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 24,
  },
});
