-- Insert sample users
INSERT INTO users (email, name, password_hash, position, department, year, bio, skills) VALUES
('admin@robotix.com', 'Admin User', '$2b$10$example', 'head-coordinator', 'Computer Science', 4, 'Head coordinator of RobotiX Club', ARRAY['Leadership', 'Project Management']),
('john@robotix.com', 'John Doe', '$2b$10$example', 'core-coordinator', 'Mechanical Engineering', 3, 'Core coordinator specializing in robotics', ARRAY['Robotics', 'Arduino', 'Python']),
('jane@robotix.com', 'Jane Smith', '$2b$10$example', 'coordinator', 'Electronics Engineering', 2, 'AI/ML enthusiast and coordinator', ARRAY['Machine Learning', 'Python', 'TensorFlow']),
('bob@robotix.com', 'Bob Wilson', '$2b$10$example', 'member', 'Computer Science', 1, 'New member interested in IoT projects', ARRAY['IoT', 'Sensors', 'C++'])
ON CONFLICT (email) DO NOTHING;

-- Insert sample projects
INSERT INTO projects (title, description, status, category, start_date, end_date, team_lead_id, team_lead_name, team_members, technologies, github_url, demo_url) VALUES
(
  'Autonomous Navigation Robot',
  'A robot capable of autonomous navigation using computer vision and sensor fusion techniques.',
  'in-progress',
  'robotics',
  '2024-01-15',
  NULL,
  1,
  'Admin User',
  '[{"id": 2, "name": "John Doe", "role": "Hardware Lead"}, {"id": 3, "name": "Jane Smith", "role": "Software Lead"}]',
  ARRAY['ROS', 'OpenCV', 'Python', 'Arduino'],
  'https://github.com/robotix/autonomous-robot',
  NULL
),
(
  'Smart Home Automation System',
  'IoT-based home automation system with voice control and mobile app integration.',
  'completed',
  'iot',
  '2023-09-01',
  '2023-12-15',
  2,
  'John Doe',
  '[{"id": 4, "name": "Bob Wilson", "role": "IoT Developer"}]',
  ARRAY['ESP32', 'Node.js', 'React Native', 'MQTT'],
  'https://github.com/robotix/smart-home',
  'https://smart-home-demo.robotix.com'
),
(
  'AI-Powered Gesture Recognition',
  'Machine learning model for real-time hand gesture recognition using computer vision.',
  'planning',
  'ai-ml',
  '2024-03-01',
  NULL,
  3,
  'Jane Smith',
  '[]',
  ARRAY['TensorFlow', 'OpenCV', 'Python', 'MediaPipe'],
  NULL,
  NULL
)
ON CONFLICT DO NOTHING;

-- Insert sample tasks
INSERT INTO tasks (title, description, status, priority, due_date, assigner_id, assigner_name, assignees) VALUES
(
  'Design robot chassis',
  'Create the mechanical design for the robot base structure',
  'in-progress',
  'high',
  '2024-02-15 23:59:59+00',
  1,
  'Admin User',
  '[{"id": 2, "name": "John Doe", "assignedAt": "2024-01-20T10:00:00Z"}]'
),
(
  'Implement SLAM algorithm',
  'Develop simultaneous localization and mapping for navigation',
  'pending',
  'medium',
  '2024-03-01 23:59:59+00',
  1,
  'Admin User',
  '[{"id": 3, "name": "Jane Smith", "assignedAt": "2024-01-22T14:30:00Z"}]'
),
(
  'Setup IoT sensors',
  'Configure and test all IoT sensors for the smart home system',
  'completed',
  'medium',
  '2023-11-30 23:59:59+00',
  2,
  'John Doe',
  '[{"id": 4, "name": "Bob Wilson", "assignedAt": "2023-11-01T09:00:00Z"}]'
)
ON CONFLICT DO NOTHING;
