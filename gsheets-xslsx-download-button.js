// ==UserScript==
// @name         Google Sheets - Download Active Tab as XLSX
// @namespace    http://tampermonkey.net/
// @version      1.4
// @description  Adds an icon button in the titlebar to export active tab as XLSX.
// @match        https://docs.google.com/spreadsheets/*
// @grant        GM_registerMenuCommand
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    console.log('[GSheets Export] Script initialized.');

    // Core export function
    function exportActiveTab() {
        var winURL = window.location.href;
        var match = winURL.match(/\/edit.*[?#]gid=(\d+)/);

        if (match) {
            var exportURL = winURL.replace(/\/edit.*/, '/export?format=xlsx&gid=' + match[1]);
            window.location.assign(exportURL);
        } else {
            alert('Could not find a valid tab ID (gid) in the current URL.');
        }
    }

    // Register popup menu command safely
    if (typeof GM_registerMenuCommand !== 'undefined') {
        GM_registerMenuCommand("Export Current Tab as XLSX", exportActiveTab);
    }

    // Inject button into titlebar
    function injectButton() {
        var titlebar = document.querySelector('.docs-titlebar-buttons');
        if (!titlebar) return false;

        var existingBtn = document.getElementById('tm-export-xlsx-btn');
        if (existingBtn && titlebar.contains(existingBtn)) return true;

        if (existingBtn) existingBtn.remove();

        var btn = document.createElement('div');
        btn.id = 'tm-export-xlsx-btn';
        btn.setAttribute('role', 'button');
        btn.setAttribute('title', 'Export Current Tab to XLSX');
        
        // Bypasses Chrome's TrustedHTML enforcement
        btn.textContent = '📥';

        // Styling to match top toolbar icons
        btn.style.width = '36px';
        btn.style.height = '36px';
        btn.style.borderRadius = '50%';
        btn.style.display = 'inline-flex';
        btn.style.alignItems = 'center';
        btn.style.justifyContent = 'center';
        btn.style.cursor = 'pointer';
        btn.style.fontSize = '16px';
        btn.style.userSelect = 'none';
        btn.style.margin = '0 4px';
        btn.style.verticalAlign = 'middle';
        btn.style.boxSizing = 'border-box';
        btn.style.transition = 'background-color 0.15s ease';

        // Hover & Click states
        btn.addEventListener('mouseenter', function() { btn.style.backgroundColor = 'rgba(60, 64, 67, 0.1)'; });
        btn.addEventListener('mouseleave', function() { btn.style.backgroundColor = 'transparent'; });
        btn.addEventListener('mousedown', function() { btn.style.backgroundColor = 'rgba(60, 64, 67, 0.2)'; });
        btn.addEventListener('mouseup', function() { btn.style.backgroundColor = 'rgba(60, 64, 67, 0.1)'; });

        btn.addEventListener('click', exportActiveTab);

        // Insert before Share button or Comments button
        var targetBefore = document.getElementById('docs-titlebar-share-client-button') ||
                           document.getElementById('docs-docos-commentsbutton');

        if (targetBefore && targetBefore.parentNode === titlebar) {
            titlebar.insertBefore(btn, targetBefore);
        } else {
            titlebar.appendChild(btn);
        }

        console.log('[GSheets Export] Button successfully inserted into titlebar.');
        return true;
    }

    // Observe DOM changes to catch dynamic UI renders instantly
    var observer = new MutationObserver(function() {
        injectButton();
    });

    observer.observe(document.body || document.documentElement, {
        childList: true,
        subtree: true
    });

    // Fallback timer check
    setInterval(injectButton, 1000);
})();
