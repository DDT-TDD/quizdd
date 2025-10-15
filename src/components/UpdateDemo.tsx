import React, { useState } from 'react';
import UpdateManager from './UpdateManager';
import styles from './UpdateDemo.module.css';

export const UpdateDemo: React.FC = () => {
  const [showUpdateManager, setShowUpdateManager] = useState(false);
  const [updateStatus, setUpdateStatus] = useState<string>('');

  const handleUpdateComplete = () => {
    setUpdateStatus('Update completed successfully!');
    setTimeout(() => setUpdateStatus(''), 3000);
  };

  const handleUpdateError = (error: string) => {
    setUpdateStatus(`Update failed: ${error}`);
    setTimeout(() => setUpdateStatus(''), 5000);
  };

  return (
    <div className={styles.updateDemo}>
      <div className={styles.header}>
        <h2>Content Update System Demo</h2>
        <p>This demonstrates the secure content update system with parental controls.</p>
      </div>

      {updateStatus && (
        <div className={`${styles.statusMessage} ${
          updateStatus.includes('failed') ? styles.error : styles.success
        }`}>
          {updateStatus}
        </div>
      )}

      <div className={styles.actions}>
        <button
          onClick={() => setShowUpdateManager(!showUpdateManager)}
          className={styles.toggleButton}
        >
          {showUpdateManager ? 'Hide Update Manager' : 'Show Update Manager'}
        </button>
      </div>

      {showUpdateManager && (
        <div className={styles.updateManagerContainer}>
          <UpdateManager
            onUpdateComplete={handleUpdateComplete}
            onUpdateError={handleUpdateError}
          />
        </div>
      )}

      <div className={styles.features}>
        <h3>Update System Features</h3>
        <ul>
          <li>✅ HTTPS-based update checking from authorized repositories</li>
          <li>✅ Cryptographic signature verification for content packages</li>
          <li>✅ Secure download and installation process</li>
          <li>✅ Authorized repository URL validation</li>
          <li>✅ Automatic backup creation before updates</li>
          <li>✅ Rollback mechanism for failed updates</li>
          <li>✅ Parental gate protection for update operations</li>
          <li>✅ Progress tracking and user feedback</li>
          <li>✅ Error handling and recovery</li>
        </ul>
      </div>

      <div className={styles.security}>
        <h3>Security Measures</h3>
        <ul>
          <li>🔒 All updates require HTTPS connections</li>
          <li>🔒 Repository URLs are validated against authorized domains</li>
          <li>🔒 Content packages are cryptographically signed</li>
          <li>🔒 Checksums are verified before installation</li>
          <li>🔒 Parental authentication required for all update operations</li>
          <li>🔒 Automatic rollback on installation failures</li>
          <li>🔒 Backup retention with configurable cleanup</li>
        </ul>
      </div>
    </div>
  );
};

export default UpdateDemo;