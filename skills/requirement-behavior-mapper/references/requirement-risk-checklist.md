# Requirement Risk Checklist

Use this checklist to find missing cases before implementation.

## User And Permission

- Which user roles can see, start, continue, cancel, or complete the behavior?
- Are unauthenticated, unverified, blocked, terminated, or restricted users handled?
- Does the behavior depend on account status, country, KYC/CDD state, feature flags, or device capability?

## State And Data

- What are the initial, intermediate, completed, failed, and retry states?
- What data is required, optional, derived, cached, or persisted?
- What happens when server data is stale, partially missing, duplicated, or changed by another session?

## Validation

- Which fields are required?
- What format, range, length, uniqueness, and domain-specific rules apply?
- Are validation errors inline, page-level, modal, toast, or blocking?
- When does validation run: on change, blur, submit, step transition, or API response?

## Async And Failure

- What loads before the user can act?
- What is disabled while submitting or loading?
- What happens on timeout, network failure, server validation failure, unknown error, or retry?
- Are duplicate submissions, back navigation, and refresh handled?

## Empty, Edge, And Navigation

- What empty states exist?
- What happens when there are zero eligible items or multiple eligible items?
- Where does the user go after success, cancel, error, timeout, or permission denial?
- Does the feature need deep-link, browser back, route guard, or modal close behavior?

## Product Quality

- Are copy, localization, accessibility labels, focus order, and keyboard behavior specified?
- Are analytics, audit logs, experiment events, or monitoring required?
- Are privacy, compliance, data retention, or consent requirements involved?
- Are tests expected for normal, loading, empty, error, permission, and validation paths?
