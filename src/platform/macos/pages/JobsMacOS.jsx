import React, { useState } from 'react';
import DriverFeed from '../../../components/DriverFeed';
import { AppleLogoIcon } from './HomeMacOS';
import './JobsMacOS.css';

export default function JobsMacOS(props) {
  return (
    <div className="macos-jobs-container fade-in hide-scrollbar">
      {/* 🍎 macOS Native Seamless Titlebar Header */}
      <div className="macos-titlebar-header">
        <div className="macos-traffic-lights">
          <span className="macos-traffic-dot macos-close" title="Close (Cmd+W)" />
          <span className="macos-traffic-dot macos-minimize" title="Minimize (Cmd+M)" />
          <span className="macos-traffic-dot macos-maximize" title="Maximize (Cmd+Ctrl+F)" />
        </div>
        <div className="macos-titlebar-title">
          <AppleLogoIcon /> 求人 — Michi Jobs (macOS)
        </div>
        <div className="macos-platform-badge">
          <span> macOS Native</span>
        </div>
      </div>

      {/* Main Driver Feed Content */}
      <div className="macos-jobs-feed-wrapper">
        <DriverFeed {...props} />
      </div>
    </div>
  );
}
