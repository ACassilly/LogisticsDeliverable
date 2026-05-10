import { NextRequest, NextResponse } from 'next/server';
import { handleApiError, withAdminAuth } from '@/server/middlewares';
import { connectDB } from '@/server/db';
import Booking, { BookingStatus } from '@/server/db/models/booking.model';

async function handler(request: NextRequest) {
  try {
    await connectDB();

    // Overall KPIs
    const overallStats = await Booking.aggregate([
      {
        $group: {
          _id: null,
          totalBookings: { $sum: 1 },
          totalRevenue: { $sum: '$totalRate' },
          paidBookings: { $sum: { $cond: [{ $eq: ['$status', BookingStatus.PAID] }, 1, 0] } },
          pendingBookings: { $sum: { $cond: [{ $eq: ['$status', BookingStatus.PENDING_PAYMENT] }, 1, 0] } },
          failedBookings: { $sum: { $cond: [{ $eq: ['$status', BookingStatus.FAILED] }, 1, 0] } },
          expiredBookings: { $sum: { $cond: [{ $eq: ['$status', BookingStatus.EXPIRED] }, 1, 0] } },
          averageRate: { $avg: '$totalRate' },
          totalWeight: { $sum: { $sum: '$items.weight' } },
        }
      }
    ]);

    const overall = overallStats[0] || {
      totalBookings: 0,
      totalRevenue: 0,
      paidBookings: 0,
      pendingBookings: 0,
      failedBookings: 0,
      expiredBookings: 0,
      averageRate: 0,
      totalWeight: 0,
    };

    // Revenue trend (last 12 months)
    const revenueTrend = await Booking.aggregate([
      {
        $match: {
          status: BookingStatus.PAID,
          createdAt: { $gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          revenue: { $sum: '$totalRate' },
          bookings: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const trend = revenueTrend.map(item => ({
      month: `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
      revenue: item.revenue,
      bookings: item.bookings,
    }));

    // KPI cards
    const kpis = [
      {
        title: 'Total Bookings',
        value: overall.totalBookings,
        change: 0, // Would need previous period comparison
        trend: 'neutral'
      },
      {
        title: 'Total Revenue',
        value: `$${overall.totalRevenue.toFixed(2)}`,
        change: 0,
        trend: 'neutral'
      },
      {
        title: 'Paid Bookings',
        value: overall.paidBookings,
        change: 0,
        trend: 'neutral'
      },
      {
        title: 'Pending Payments',
        value: overall.pendingBookings,
        change: 0,
        trend: 'neutral'
      },
      {
        title: 'Failed Bookings',
        value: overall.failedBookings,
        change: 0,
        trend: 'neutral'
      },
      {
        title: 'Expired Bookings',
        value: overall.expiredBookings,
        change: 0,
        trend: 'neutral'
      },
      {
        title: 'Average Rate',
        value: `$${overall.averageRate.toFixed(2)}`,
        change: 0,
        trend: 'neutral'
      },
      {
        title: 'Total Weight Shipped',
        value: `${overall.totalWeight.toFixed(0)} lbs`,
        change: 0,
        trend: 'neutral'
      }
    ];

    return NextResponse.json({
      success: true,
      data: {
        kpis,
        revenueTrend: trend
      },
      message: 'Leadership KPIs retrieved successfully'
    }, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}

export const GET = withAdminAuth(handler);