class Question {
    constructor(id, title = "", required = false, type = 'radio') {
        this.id = id;
        this.title = title;
        this.required = required;
        this.type = type;
        this.min = 0;
        this.max = 1;
        this.options = [""];
    }

    swapOptions(i, j) {
        [this.options[i], this.options[j]] = [this.options[j], this.options[i]];
    }

    reorderOptions(from, to) {
        this.options.move(from, to);
    }

    setType(type) {
        this.type = type;
        switch (type) {
            case 'open':
                this.options = undefined;
                this.min = undefined;
                this.max = undefined;
                break;
            case 'radio':
                if (this.options === undefined)
                    this.options = [""];
                if (!this.min)
                    this.min = this.required ? 1 : 0;
                this.max = 1;
                break;
            default:
                if (this.options === undefined)
                    this.options = ["",""];
                if (!this.min)
                    this.min = this.required ? 1 : 0;
                this.max = 2;
                break;
        }
    }

    setRequired(required) {
        this.required = required;
        if (required === true && this.min === 0)
            this.min = 1;
        else if (required === false)
            this.min = 0;
    }

    setMin(min) {
        min = parseInt(min);
        this.min = min;
        this.required = min !== 0;
        if (min > this.max)
            this.setMax(min);
    }

    setMax(max) {
        max = parseInt(max);
        this.max = max;
        if (max === 1)
            this.type = 'radio'
        else if (max > 1)
            this.type = 'multiple'
    }


}

export default Question;