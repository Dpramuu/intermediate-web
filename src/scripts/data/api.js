import { getAccessToken } from '../utils/auth';
import { BASE_URL } from '../config';

const ENDPOINTS = {

  REGISTER: `${BASE_URL}/register`,
  LOGIN: `${BASE_URL}/login`,
  MY_USER_INFO: `${BASE_URL}/stories`,

  REPORT_LIST: `${BASE_URL}/stories`,
  REPORT_DETAIL: (id) => `${BASE_URL}/stories/${id}`, 
  STORE_NEW_REPORT: `${BASE_URL}/stories`,
  REPORT_COMMENTS_LIST: (id) => `${BASE_URL}/stories/${id}/comments`,
  STORE_NEW_REPORT_COMMENT: (id) => `${BASE_URL}/stories/${id}/comments`,

  SUBSCRIBE: `${BASE_URL}/notifications/subscribe`,
  UNSUBSCRIBE: `${BASE_URL}/notifications/subscribe`,
  SEND_REPORT_TO_ME: (reportId) => `${BASE_URL}/reports/${reportId}/notify-me`,
  SEND_REPORT_TO_USER: (reportId) => `${BASE_URL}/reports/${reportId}/notify`,
  SEND_REPORT_TO_ALL_USER: (reportId) => `${BASE_URL}/reports/${reportId}/notify-all`,
  SEND_COMMENT_TO_REPORT_OWNER: (reportId, commentId) =>
    `${BASE_URL}/reports/${reportId}/comments/${commentId}/notify`,
};

export async function getRegistered({ name, email, password }) {
  const data = JSON.stringify({ name, email, password });

  const fetchResponse = await fetch(ENDPOINTS.REGISTER, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: data,
  });
  const json = await fetchResponse.json();

  return {
    ...json,
    ok: fetchResponse.ok,
  };
}

export async function getLogin({ email, password }) {
  const data = JSON.stringify({ email, password });

  const fetchResponse = await fetch(ENDPOINTS.LOGIN, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: data,
  });
  const json = await fetchResponse.json();

  if (!json.error) {
    return {
      ok: true,
      message: json.message,
      data: {
        accessToken: json.loginResult.token,
        userId: json.loginResult.userId,
        name: json.loginResult.name,
      },
    };
  }

  return {
    ok: false,
    message: json.message,
  };
}

export async function getMyUserInfo() {
  const accessToken = getAccessToken();

  const fetchResponse = await fetch(ENDPOINTS.MY_USER_INFO, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const json = await fetchResponse.json();

  return {
    ...json,
    ok: fetchResponse.ok,
  };
}

export async function getAllReports() {
  const accessToken = getAccessToken();

  try {
    const fetchResponse = await fetch(ENDPOINTS.REPORT_LIST, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const json = await fetchResponse.json();

    console.debug('getAllReports response:', json);

    if (!json.error && Array.isArray(json.listStory)) {
      const mappedReports = json.listStory.map(story => ({
        id: story.id || '',
        title: story.name || '',
        description: story.description || '',
        evidenceImages: story.photoUrl ? [story.photoUrl] : [],
        latitude: story.lat || null,
        longitude: story.lon || null,
        createdAt: story.createdAt || new Date().toISOString(),
        reporterName: story.name || 'Unknown' 
      }));

      return {
        ok: true,
        message: json.message || 'Success',
        data: mappedReports || [], 
      };
    }

    return {
      ok: false,
      message: json.message || 'Failed to fetch reports',
      data: [], 
    };
  } catch (error) {
    console.error('getAllReports error:', error);
    return {
      ok: false,
      message: error.message || 'Network error',
      data: [], 
    };
  }
}

export async function getReportById(id) {
  const accessToken = getAccessToken();

  try {
    const fetchResponse = await fetch(ENDPOINTS.REPORT_DETAIL(id), {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const json = await fetchResponse.json();

    console.debug('getReportById response:', json);

    if (!json.error && json.story) {
      const story = json.story;
      return {
        ok: true,
        data: {
          id: story.id || '',
          title: story.name || '',
          description: story.description || '',
          damageLevel: 'moderate', 
          evidenceImages: story.photoUrl ? [story.photoUrl] : [],
          location: {
            latitude: story.lat || null,
            longitude: story.lon || null,
          },
          reporter: {
            name: story.name || 'Unknown'
          },
          createdAt: story.createdAt || new Date().toISOString(),
        },
      };
    }

    return {
      ok: false,
      message: json.message || 'Report not found',
    };
  } catch (error) {
    console.error('getReportById error:', error);
    return {
      ok: false,
      message: error.message || 'Failed to fetch report details',
    };
  }
}

export async function storeNewReport({
  name,
  damageLevel,
  description, 
  evidenceImages, 
  latitude, 
  longitude
}) {
  const accessToken = getAccessToken();

  const formData = new FormData();
  formData.set('name', name);
  formData.set('damageLevel', damageLevel);
  formData.set('description', description);
  formData.set('photo', evidenceImages[0]); 
  if (latitude) formData.set('lat', latitude);
  if (longitude) formData.set('lon', longitude);

  const fetchResponse = await fetch(ENDPOINTS.STORE_NEW_REPORT, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
    body: formData,
  });
  const json = await fetchResponse.json();

  if (!json.error) {
    return {
      ok: true,
      message: json.message,
    };
  }

  return {
    ok: false,
    message: json.message,
  };
}

export async function getAllCommentsByReportId(reportId) {
  try {
    return {
      ok: true,
      message: 'Fitur komentar belum tersedia',
      data: [],
    };
  } catch (error) {
    console.error('getAllCommentsByReportId error:', error);
    return {
      ok: false,
      message: error.message || 'Error fetching comments',
      data: [],
    };
  }
}

export async function storeNewCommentByReportId(reportId, { body }) {
  try {
    return {
      ok: false,
      message: 'Fitur komentar belum tersedia',
    };
  } catch (error) {
    console.error('storeNewCommentByReportId error:', error);
    return {
      ok: false,
      message: error.message || 'Error posting comment',
    };
  }
}

export async function subscribePushNotification({ endpoint, keys: { p256dh, auth } }) {
  const accessToken = getAccessToken();
  const data = JSON.stringify({
    endpoint,
    keys: { p256dh, auth },
  });

  const fetchResponse = await fetch(ENDPOINTS.SUBSCRIBE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: data,
  });
  const json = await fetchResponse.json();

  return {
    ...json,
    ok: fetchResponse.ok,
  };
}

export async function unsubscribePushNotification({ endpoint }) {
  const accessToken = getAccessToken();
  const data = JSON.stringify({
    endpoint,
  });

  const fetchResponse = await fetch(ENDPOINTS.UNSUBSCRIBE, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: data,
  });
  const json = await fetchResponse.json();

  return {
    ...json,
    ok: fetchResponse.ok,
  };
}

export async function sendReportToMeViaNotification(reportId) {
  const accessToken = getAccessToken();

  const fetchResponse = await fetch(ENDPOINTS.SEND_REPORT_TO_ME(reportId), {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const json = await fetchResponse.json();

  return {
    ...json,
    ok: fetchResponse.ok,
  };
}

export async function sendReportToUserViaNotification(reportId, { userId }) {
  const accessToken = getAccessToken();
  const data = JSON.stringify({
    userId,
  });

  const fetchResponse = await fetch(ENDPOINTS.SEND_REPORT_TO_USER(reportId), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: data,
  });
  const json = await fetchResponse.json();

  return {
    ...json,
    ok: fetchResponse.ok,
  };
}

export async function sendReportToAllUserViaNotification(reportId) {
  const accessToken = getAccessToken();

  const fetchResponse = await fetch(ENDPOINTS.SEND_REPORT_TO_ALL_USER(reportId), {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const json = await fetchResponse.json();

  return {
    ...json,
    ok: fetchResponse.ok,
  };
}

export async function sendCommentToReportOwnerViaNotification(reportId, commentId) {
  const accessToken = getAccessToken();

  const fetchResponse = await fetch(ENDPOINTS.SEND_COMMENT_TO_REPORT_OWNER(reportId, commentId), {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const json = await fetchResponse.json();

  return {
    ...json,
    ok: fetchResponse.ok,
  };
}
