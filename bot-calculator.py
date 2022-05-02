#!/usr/bin/env python

import argparse

def calculate_max_bot_usage(args) -> float:
    safety_order_useage = 0.0
    for x in range(1, args.number_of_safety_orders):
        safety_order_useage += (x - 1) * args.safety_order_scaling + args.safety_order_size
    return args.base_order_size + safety_order_useage

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('-b', '--num_bots', type=int, default=1)
    parser.add_argument('-so', '--safety_order_size', type=float, default=1.0)
    parser.add_argument('-bo', '--base_order_size', type=float, default=1.0)
    parser.add_argument('-sos', '--safety_order_scaling', type=float, default=1.0)
    parser.add_argument('-nso', '--number_of_safety_orders', type=int, default=1)
    args = parser.parse_args()

    max_dollars_per_bot = calculate_max_bot_usage(args)
    total_dollars_needed = args.num_bots * max_dollars_per_bot
    print(f'Total dollars needed:\t${total_dollars_needed:.2f}')
    print(f'Max dollars per bot:\t${max_dollars_per_bot:.2f}')

    print("Potential profits/month")
    # Show profit as a percentage of the total investment
    for x in range(1, 11):
        print(f'Profit as {x}%:\t${((x / 100) * total_dollars_needed):.2f}')
