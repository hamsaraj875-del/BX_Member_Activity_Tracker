import Setting from '../models/Setting.js';

// @desc    Get system settings
// @route   GET /api/settings
// @access  Private
export const getSettings = async (req, res, next) => {
  try {
    const isStaff = ['superadmin', 'lead'].includes(req.user.role);
    const query = isStaff ? {} : { isPublic: true };

    const settings = await Setting.find(query).lean();

    const configMap = {};
    settings.forEach(s => {
      configMap[s.key] = s.value;
    });

    // Provide default system config if database has none
    const responseSettings = {
      mockDataMode: process.env.USE_MOCK_DATA === 'true',
      clubName: configMap.clubName || 'BX Technical Club',
      tagline: configMap.tagline || 'Building Exceptional Engineers',
      minAttendanceThreshold: configMap.minAttendanceThreshold || 75,
      enabledPlatforms: configMap.enabledPlatforms || ['github', 'leetcode', 'codeforces', 'kaggle', 'hackerrank', 'geeksforgeeks'],
      autoSyncIntervalHours: configMap.autoSyncIntervalHours || 12,
      ...configMap,
    };

    res.json({
      success: true,
      data: responseSettings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update system settings (Superadmin only)
// @route   PUT /api/settings
// @access  Private (Superadmin)
export const updateSettings = async (req, res, next) => {
  try {
    const updates = req.body; // { key: value, ... }

    for (let key of Object.keys(updates)) {
      await Setting.findOneAndUpdate(
        { key },
        { key, value: updates[key], updatedAt: new Date() },
        { upsert: true, new: true }
      );
    }

    res.json({
      success: true,
      message: 'System settings updated successfully',
      data: updates,
    });
  } catch (error) {
    next(error);
  }
};
