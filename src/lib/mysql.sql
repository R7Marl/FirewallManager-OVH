CREATE TABLE `users` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `email` varchar(255) NOT NULL,
    `password` varchar(255) NOT NULL,
    `admin` int(11) NOT NULL DEFAULT '0',
    `created` datetime NOT NULL,
    `updated` datetime NOT NULL,
    PRIMARY KEY (`id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8;
CREATE TABLE `servers` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `IPBlock` varchar(255) NOT NULL,
    `IP` varchar(255) NOT NULL,
    `owner` varchar(255) NOT NULL,
    `type` varchar(255) NOT NULL DEFAULT 'OVH Game',
    `firewallgame` varchar(255) NOT NULL,
    `firewall` varchar(255) NOT NULL,
    `created` datetime NOT NULL,
    `vencimiento` VARCHAR(255) NOT NULL,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
CREATE TABLE `logs` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `user_id` int(11) NOT NULL,
    `server_id` int(11) NOT NULL,
    `created` datetime NOT NULL,
    `action` varchar(255) NOT NULL,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;