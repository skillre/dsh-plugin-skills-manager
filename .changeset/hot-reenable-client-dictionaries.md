---
'@skillre/dsh-plugin-skills-manager': patch
---

Fix hot re-enable of the Client half: register both locale dictionaries in one Fiber-owned effect so switching the bundle off removes them, and switching it back on mounts the sidebar entry and main panel again instead of failing on a duplicate dictionary registration.
