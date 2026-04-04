import { google } from 'googleapis';

// Check if Google Calendar is configured
export const isCalendarConfigured = () => {
    return !!(
        process.env.GOOGLE_CALENDAR_CLIENT_ID &&
        process.env.GOOGLE_CALENDAR_CLIENT_SECRET &&
        process.env.GOOGLE_CALENDAR_REDIRECT_URI
    );
};

// Create OAuth2 client
export const createOAuth2Client = () => {
    if (!isCalendarConfigured()) {
        console.log('⚠️  Google Calendar not configured');
        return null;
    }

    return new google.auth.OAuth2(
        process.env.GOOGLE_CALENDAR_CLIENT_ID,
        process.env.GOOGLE_CALENDAR_CLIENT_SECRET,
        process.env.GOOGLE_CALENDAR_REDIRECT_URI
    );
};

// Get authorization URL
export const getAuthUrl = (userId) => {
    const oauth2Client = createOAuth2Client();
    if (!oauth2Client) return null;

    const scopes = ['https://www.googleapis.com/auth/calendar'];

    return oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes,
        prompt: 'consent',
        state: userId // Pass userId to identify user after OAuth
    });
};

// Get tokens from code
export const getTokensFromCode = async (code) => {
    const oauth2Client = createOAuth2Client();
    if (!oauth2Client) return null;

    try {
        const { tokens } = await oauth2Client.getToken(code);
        return tokens;
    } catch (error) {
        console.error('Error getting tokens:', error);
        return null;
    }
};

// Create calendar event from task
export const createCalendarEvent = async (task, tokens) => {
    const oauth2Client = createOAuth2Client();
    if (!oauth2Client) return { success: false, message: 'Calendar not configured' };

    oauth2Client.setCredentials(tokens);
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    try {
        // Determine event time
        let startTime, endTime;
        if (task.dueDate) {
            startTime = new Date(task.dueDate);
            endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // 1 hour duration
        } else {
            // If no due date, create all-day event for today
            startTime = new Date();
            startTime.setHours(0, 0, 0, 0);
            endTime = new Date(startTime);
            endTime.setDate(endTime.getDate() + 1);
        }

        const event = {
            summary: task.title,
            description: buildEventDescription(task),
            start: task.dueDate 
                ? { dateTime: startTime.toISOString(), timeZone: 'UTC' }
                : { date: startTime.toISOString().split('T')[0] },
            end: task.dueDate
                ? { dateTime: endTime.toISOString(), timeZone: 'UTC' }
                : { date: endTime.toISOString().split('T')[0] },
            colorId: getPriorityColor(task.priority),
            reminders: {
                useDefault: false,
                overrides: [
                    { method: 'email', minutes: 60 },
                    { method: 'popup', minutes: 30 }
                ]
            }
        };

        const response = await calendar.events.insert({
            calendarId: 'primary',
            resource: event
        });

        console.log(`✅ Calendar event created: ${response.data.id}`);
        return { 
            success: true, 
            eventId: response.data.id,
            eventLink: response.data.htmlLink
        };
    } catch (error) {
        console.error('Error creating calendar event:', error);
        return { success: false, error: error.message };
    }
};

// Update calendar event
export const updateCalendarEvent = async (eventId, task, tokens) => {
    const oauth2Client = createOAuth2Client();
    if (!oauth2Client) return { success: false, message: 'Calendar not configured' };

    oauth2Client.setCredentials(tokens);
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    try {
        let startTime, endTime;
        if (task.dueDate) {
            startTime = new Date(task.dueDate);
            endTime = new Date(startTime.getTime() + 60 * 60 * 1000);
        } else {
            startTime = new Date();
            startTime.setHours(0, 0, 0, 0);
            endTime = new Date(startTime);
            endTime.setDate(endTime.getDate() + 1);
        }

        const event = {
            summary: task.title,
            description: buildEventDescription(task),
            start: task.dueDate 
                ? { dateTime: startTime.toISOString(), timeZone: 'UTC' }
                : { date: startTime.toISOString().split('T')[0] },
            end: task.dueDate
                ? { dateTime: endTime.toISOString(), timeZone: 'UTC' }
                : { date: endTime.toISOString().split('T')[0] },
            colorId: getPriorityColor(task.priority)
        };

        await calendar.events.update({
            calendarId: 'primary',
            eventId: eventId,
            resource: event
        });

        console.log(`✅ Calendar event updated: ${eventId}`);
        return { success: true };
    } catch (error) {
        console.error('Error updating calendar event:', error);
        return { success: false, error: error.message };
    }
};

// Delete calendar event
export const deleteCalendarEvent = async (eventId, tokens) => {
    const oauth2Client = createOAuth2Client();
    if (!oauth2Client) return { success: false, message: 'Calendar not configured' };

    oauth2Client.setCredentials(tokens);
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    try {
        await calendar.events.delete({
            calendarId: 'primary',
            eventId: eventId
        });

        console.log(`✅ Calendar event deleted: ${eventId}`);
        return { success: true };
    } catch (error) {
        console.error('Error deleting calendar event:', error);
        return { success: false, error: error.message };
    }
};

// Helper: Build event description
const buildEventDescription = (task) => {
    let description = '';
    
    if (task.description) {
        description += `${task.description}\n\n`;
    }
    
    description += `Priority: ${task.priority.toUpperCase()}\n`;
    description += `Status: ${task.status}\n`;
    
    if (task.tags && task.tags.length > 0) {
        description += `Tags: ${task.tags.join(', ')}\n`;
    }
    
    if (task.subtasks && task.subtasks.length > 0) {
        description += `\nSubtasks:\n`;
        task.subtasks.forEach(st => {
            description += `${st.completed ? '✓' : '○'} ${st.text}\n`;
        });
    }
    
    if (task.notes) {
        description += `\nNotes:\n${task.notes}\n`;
    }
    
    description += `\nView in Task Manager: ${process.env.CLIENT_URL || 'http://localhost:5173'}/dashboard`;
    
    return description;
};

// Helper: Get color ID based on priority
const getPriorityColor = (priority) => {
    // Google Calendar color IDs
    // 11 = Red (High), 5 = Yellow (Medium), 10 = Green (Low)
    switch (priority) {
        case 'high': return '11';
        case 'medium': return '5';
        case 'low': return '10';
        default: return '1';
    }
};
