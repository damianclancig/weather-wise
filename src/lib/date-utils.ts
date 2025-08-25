export const parseDateString = (dt: string | number) => {
    const dtStr = String(dt);
    // If it's just a date 'YYYY-MM-DD', replace dashes to avoid UTC parsing issues.
    // If it's a full ISO string, it can be parsed directly.
    if (!dtStr.includes('T')) {
      return new Date(dtStr.replace(/-/g, '/'));
    }
    return new Date(dtStr);
};
