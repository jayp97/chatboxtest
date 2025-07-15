# Location Question Tracking Feature Specification

## Overview

This specification defines a new feature for the GEOSYS Terminal geography chatbot that automatically tracks and visualises location-based questions. When users ask questions about specific locations (e.g., "Where is the tallest building in the world?"), the system will extract coordinates from the LLM response and display these as red pins on the globe.

## Feature Requirements

### Core Functionality

1. **Location Question Detection**
   - Automatically detect when user questions reference specific geographic locations
   - Identify queries about landmarks, buildings, attractions, geographic features, and points of interest
   - Extract location names and coordinates from LLM responses

2. **Coordinate Extraction and Storage**
   - Extract precise coordinates (latitude/longitude) from the geography expert's responses
   - Store location data with associated question/answer pairs in localStorage
   - Maintain history of all location-based queries with timestamps

3. **Globe Visualisation**
   - Display tracked locations as red pins on the 3D globe
   - Show location names and associated questions on pin hover/click
   - Persist pin visibility across sessions

4. **Data Persistence**
   - Store location query history in localStorage
   - Maintain data consistency with existing preference storage system
   - Support data export and import functionality

## Technical Architecture

### Data Models

#### LocationQuery Interface
```typescript
interface LocationQuery {
  id: string;                    // Unique identifier
  question: string;              // Original user question
  response: string;              // LLM response (truncated for storage)
  locationName: string;          // Extracted location name
  coordinates: {                 // Precise coordinates
    lat: number;
    lng: number;
  };
  timestamp: Date;               // When the query was made
  threadId: string;              // Associated conversation thread
  userId: string;                // User who made the query
}
```

#### Enhanced LocationCoordinate Interface
```typescript
interface LocationCoordinate {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: 'favourite' | 'recent' | 'current' | 'historical' | 'query';  // Add 'query' type
  metadata?: {                   // Additional data for query pins
    question?: string;
    response?: string;
    timestamp?: Date;
  };
}
```

### Storage System

#### LocationQueryStorage Utility
- **File:** `src/utils/location-query-storage.ts`
- **Purpose:** Manage localStorage operations for location queries
- **Key Functions:**
  - `storeLocationQuery(query: LocationQuery): void`
  - `getLocationQueries(userId: string): LocationQuery[]`
  - `clearLocationQueries(userId: string): void`
  - `exportLocationQueries(userId: string): string`
  - `importLocationQueries(userId: string, data: string): void`

#### Storage Schema
```typescript
// localStorage key pattern
const LOCATION_QUERIES_KEY = `geosys-location-queries-${env}-${userId}`;

// Storage format
interface LocationQueryStorage {
  queries: LocationQuery[];
  lastUpdated: Date;
  version: string;
}
```

### Detection and Extraction System

#### Location Detection Tool
- **File:** `src/mastra/tools/location-detector.ts`
- **Purpose:** Enhanced tool for detecting and extracting location information
- **Schema:**
```typescript
const locationDetectionSchema = z.object({
  hasLocation: z.boolean(),
  locationName: z.string().optional(),
  coordinates: z.object({
    lat: z.number(),
    lng: z.number()
  }).optional(),
  confidence: z.number().min(0).max(1)
});
```

#### Response Processing Pipeline
1. **Question Analysis:** Determine if question is location-based
2. **Response Parsing:** Extract location names and coordinates from LLM response
3. **Coordinate Validation:** Verify coordinates are valid and precise
4. **Storage:** Save LocationQuery to localStorage
5. **Globe Update:** Trigger globe re-render with new pin

### Globe Integration

#### Enhanced LocationPins Component
- **File:** `src/components/globe/LocationPins.tsx` (modified)
- **Changes:**
  - Support for 'query' type pins with red colour (#ff0000)
  - Enhanced hover/click interactions for query pins
  - Metadata display for question context

#### Pin Styling
```typescript
const colours = {
  favourite: "#ffd700",    // Gold
  recent: "#00ff00",       // Green
  current: "#ff00ff",      // Magenta
  historical: "#888888",   // Gray
  query: "#ff0000"         // Red (NEW)
};
```

### Agent Integration

#### Enhanced Geography Expert Agent
- **File:** `src/mastra/agents/geography-expert.ts` (modified)
- **Changes:**
  - Add location detection tool to agent toolkit
  - Update system prompt to support location extraction
  - Add response post-processing for coordinate extraction

#### Agent Prompt Enhancement
```
LOCATION TRACKING:
- When answering questions about specific locations, ALWAYS provide precise coordinates
- Use the location detection tool to identify geographic references
- Format location responses with coordinates in [lat, lng] format
- Example: "The Burj Khalifa is located in Dubai, UAE [25.1972, 55.2744]"
```

### API Integration

#### Enhanced Streaming Endpoint
- **File:** `src/app/api/stream/route.ts` (modified)
- **Changes:**
  - Add post-processing for location extraction
  - Store LocationQuery objects after successful responses
  - Return location metadata in response headers

#### Response Processing Flow
1. **Standard Response:** Process geography expert response normally
2. **Location Detection:** Analyse response for location references
3. **Coordinate Extraction:** Extract coordinates using detection tool
4. **Storage:** Save LocationQuery if location detected
5. **Globe Update:** Trigger client-side globe refresh

## Implementation Plan

### Phase 1: Core Infrastructure (High Priority)
1. **Location Query Storage System**
   - Create `location-query-storage.ts` utility
   - Implement localStorage management functions
   - Add data validation and error handling

2. **Location Detection Tool**
   - Create `location-detector.ts` Mastra tool
   - Implement coordinate extraction logic
   - Add confidence scoring for location detection

3. **Data Models and Types**
   - Update TypeScript interfaces
   - Add LocationQuery type definitions
   - Extend existing location types

### Phase 2: Agent Integration (Medium Priority)
1. **Geography Expert Enhancement**
   - Add location detection tool to agent toolkit
   - Update system prompt for location tracking
   - Implement response post-processing

2. **API Endpoint Enhancement**
   - Modify streaming endpoint for location processing
   - Add location metadata to responses
   - Implement error handling for detection failures

### Phase 3: Globe Visualisation (Medium Priority)
1. **LocationPins Component Enhancement**
   - Add 'query' pin type support
   - Implement red pin styling
   - Add metadata display functionality

2. **Globe Integration**
   - Update location service to include query pins
   - Add real-time globe refresh capability
   - Implement pin interaction handlers

### Phase 4: User Experience (Low Priority)
1. **Query History Interface**
   - Add command for viewing location history
   - Implement query search functionality
   - Add data export/import features

2. **Pin Management**
   - Add pin toggle functionality
   - Implement pin clustering for dense areas
   - Add pin details modal

## Data Flow

### Query Processing Flow
```
User Question → Geography Expert → Response Analysis → Location Detection → Coordinate Extraction → Storage → Globe Update
```

### Detailed Steps
1. **User Input:** User asks location-based question
2. **Agent Processing:** Geography expert generates response
3. **Location Detection:** System analyses response for location references
4. **Coordinate Extraction:** Extract precise coordinates using detection tool
5. **Data Storage:** Save LocationQuery to localStorage
6. **Globe Update:** Add red pin to globe at extracted coordinates
7. **User Feedback:** Display updated globe with new pin

## Example Usage Scenarios

### Scenario 1: Landmark Query
- **User:** "Where is the tallest building in the world?"
- **Agent:** "The tallest building in the world is the Burj Khalifa in Dubai, UAE [25.1972, 55.2744]"
- **System:** Extracts coordinates, stores query, displays red pin on globe

### Scenario 2: Geographic Feature Query
- **User:** "What's the deepest point in the ocean?"
- **Agent:** "The deepest point is Challenger Deep in the Mariana Trench [11.3733, 142.5917]"
- **System:** Stores location, displays red pin in Pacific Ocean

### Scenario 3: Historical Location Query
- **User:** "Where was the ancient city of Babylon?"
- **Agent:** "Ancient Babylon was located in modern-day Iraq [32.5355, 44.4275]"
- **System:** Tracks historical location, displays red pin

## Testing Strategy

### Unit Tests
- Location detection accuracy
- Coordinate extraction precision
- Storage system reliability
- Pin rendering correctness

### Integration Tests
- End-to-end query processing
- Globe update synchronisation
- Data persistence across sessions
- Agent tool integration

### User Experience Tests
- Pin visibility and interaction
- Query history functionality
- Performance with many pins
- Mobile responsiveness

## Performance Considerations

### Storage Optimisation
- Implement query limit (default: 100 queries per user)
- Add automatic cleanup of old queries
- Compress response text for storage efficiency

### Globe Performance
- Implement pin clustering for dense areas
- Add viewport culling for distant pins
- Optimise pin rendering for performance

### Memory Management
- Lazy load query metadata
- Implement efficient pin update batching
- Monitor localStorage usage limits

## Security and Privacy

### Data Protection
- Store only necessary location data
- Implement user data deletion capabilities
- Add privacy controls for location tracking

### Validation
- Validate coordinates before storage
- Sanitise user input and responses
- Implement rate limiting for queries

## Future Enhancements

### Advanced Features
- Location clustering and grouping
- Query similarity detection
- Personalized location recommendations
- Integration with external mapping services

### Analytics
- Usage pattern analysis
- Popular location tracking
- Query effectiveness metrics

## Conclusion

This location question tracking feature represents a natural extension of the existing GEOSYS Terminal system. By leveraging the current architecture with LocationPins, localStorage, and the Mastra agent system, we can provide users with a rich, interactive geography experience that visualises their exploration history on the globe.

The implementation follows the existing patterns and conventions, ensuring consistency with the current codebase while adding significant value through automatic location tracking and visualisation.